import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const daysParam = req.nextUrl.searchParams.get("days") ?? "30";
  const days = parseInt(daysParam, 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all runs with host info within the date range
  const runs = await prisma.testRun.findMany({
    where: {
      startedAt: { gte: since },
      host: { not: null },
    },
    select: {
      host: true,
      startedAt: true,
      total: true,
      passed: true,
      failed: true,
    },
    orderBy: { startedAt: "asc" },
  });

  // Build heatmap data: host × date → pass rate
  const hostDateMap = new Map<string, Map<string, { passed: number; total: number }>>();
  const hostTotals = new Map<
    string,
    { runs: number; total: number; passed: number; failed: number; lastRun: Date }
  >();

  for (const run of runs) {
    const host = run.host ?? "unknown";
    const date = run.startedAt.toISOString().split("T")[0];

    // Heatmap aggregation
    if (!hostDateMap.has(host)) hostDateMap.set(host, new Map());
    const dateMap = hostDateMap.get(host)!;
    const existing = dateMap.get(date) ?? { passed: 0, total: 0 };
    existing.passed += run.passed;
    existing.total += run.total;
    dateMap.set(date, existing);

    // Summary aggregation
    const summary = hostTotals.get(host) ?? {
      runs: 0,
      total: 0,
      passed: 0,
      failed: 0,
      lastRun: run.startedAt,
    };
    summary.runs++;
    summary.total += run.total;
    summary.passed += run.passed;
    summary.failed += run.failed;
    if (run.startedAt > summary.lastRun) summary.lastRun = run.startedAt;
    hostTotals.set(host, summary);
  }

  // Build date range for heatmap x-axis
  const dates: string[] = [];
  const cursor = new Date(since);
  const today = new Date();
  while (cursor <= today) {
    dates.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 1);
  }

  // Build heatmap rows
  const heatmap = Array.from(hostDateMap.entries()).map(([host, dateMap]) => ({
    id: host,
    data: dates.map((date) => {
      const cell = dateMap.get(date);
      return {
        x: date,
        y: cell && cell.total > 0
          ? Math.round((cell.passed / cell.total) * 100)
          : -1, // -1 means no data
      };
    }),
  }));

  // Build host summaries
  const summaries = Array.from(hostTotals.entries()).map(([host, s]) => ({
    host,
    totalRuns: s.runs,
    totalTests: s.total,
    passed: s.passed,
    failed: s.failed,
    passRate: s.total > 0 ? Math.round((s.passed / s.total) * 1000) / 10 : 0,
    lastRun: s.lastRun.toISOString(),
  }));

  return NextResponse.json({ heatmap, summaries, dates });
}

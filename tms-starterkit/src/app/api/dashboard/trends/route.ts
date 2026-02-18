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

  const runs = await prisma.testRun.findMany({
    where: { startedAt: { gte: since } },
    orderBy: { startedAt: "asc" },
    select: {
      startedAt: true,
      total: true,
      passed: true,
      failed: true,
      skipped: true,
    },
  });

  // Aggregate by day
  const dailyMap = new Map<
    string,
    { total: number; passed: number; failed: number; skipped: number; runCount: number }
  >();

  for (const run of runs) {
    const date = run.startedAt.toISOString().split("T")[0];
    const existing = dailyMap.get(date) ?? {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      runCount: 0,
    };
    existing.total += run.total;
    existing.passed += run.passed;
    existing.failed += run.failed;
    existing.skipped += run.skipped;
    existing.runCount++;
    dailyMap.set(date, existing);
  }

  const trend = Array.from(dailyMap.entries()).map(([date, d]) => ({
    date,
    passRate: d.total > 0 ? Math.round((d.passed / d.total) * 1000) / 10 : 0,
    total: d.total,
    passed: d.passed,
    failed: d.failed,
    skipped: d.skipped,
    runCount: d.runCount,
  }));

  // Compute period summary
  const totals = runs.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      passed: acc.passed + r.passed,
      failed: acc.failed + r.failed,
      skipped: acc.skipped + r.skipped,
      runs: acc.runs + 1,
    }),
    { total: 0, passed: 0, failed: 0, skipped: 0, runs: 0 }
  );

  return NextResponse.json({
    trend,
    summary: {
      ...totals,
      passRate:
        totals.total > 0
          ? Math.round((totals.passed / totals.total) * 1000) / 10
          : 0,
    },
  });
}

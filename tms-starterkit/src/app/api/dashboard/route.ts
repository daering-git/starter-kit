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

  // Aggregate totals
  const totals = await prisma.testRun.aggregate({
    _sum: { total: true, passed: true, failed: true, skipped: true },
    _count: true,
  });

  const totalTests = totals._sum.total ?? 0;
  const totalPassed = totals._sum.passed ?? 0;
  const totalFailed = totals._sum.failed ?? 0;
  const totalSkipped = totals._sum.skipped ?? 0;
  const avgPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  // Recent runs
  const recentRuns = await prisma.testRun.findMany({
    take: 5,
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      name: true,
      startedAt: true,
      passed: true,
      failed: true,
      total: true,
    },
  });

  // Daily trend (pass rate per day)
  const runsInRange = await prisma.testRun.findMany({
    where: { startedAt: { gte: since } },
    orderBy: { startedAt: "asc" },
    select: { startedAt: true, passed: true, total: true },
  });

  const dailyMap = new Map<string, { passed: number; total: number }>();
  for (const run of runsInRange) {
    const date = run.startedAt.toISOString().split("T")[0];
    const existing = dailyMap.get(date) ?? { passed: 0, total: 0 };
    existing.passed += run.passed;
    existing.total += run.total;
    dailyMap.set(date, existing);
  }

  const dailyTrend = Array.from(dailyMap.entries()).map(
    ([date, { passed, total }]) => ({
      date,
      passRate: total > 0 ? Math.round((passed / total) * 1000) / 10 : 0,
      total,
    })
  );

  // Suite breakdown (top 10 suites by test count)
  const suiteStats = await prisma.testSuite.groupBy({
    by: ["name"],
    _sum: { passed: true, failed: true, skipped: true },
    _count: true,
    orderBy: { _count: { name: "desc" } },
    take: 10,
  });

  const suiteBreakdown = suiteStats.map((s) => ({
    name: s.name,
    passed: s._sum.passed ?? 0,
    failed: s._sum.failed ?? 0,
    skipped: s._sum.skipped ?? 0,
  }));

  return NextResponse.json({
    totalRuns: totals._count,
    totalTests,
    totalPassed,
    totalFailed,
    totalSkipped,
    avgPassRate: Math.round(avgPassRate * 10) / 10,
    recentRuns,
    dailyTrend,
    suiteBreakdown,
  });
}

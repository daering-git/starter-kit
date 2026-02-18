import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  // Aggregate per-suite statistics across all runs
  const suiteStats = await prisma.testSuite.groupBy({
    by: ["name"],
    _sum: { total: true, passed: true, failed: true, skipped: true, duration: true },
    _count: true,
    _avg: { duration: true },
    orderBy: { _sum: { total: "desc" } },
  });

  const suites = suiteStats.map((s) => {
    const totalTests = s._sum.total ?? 0;
    const passed = s._sum.passed ?? 0;
    const failed = s._sum.failed ?? 0;
    const skipped = s._sum.skipped ?? 0;

    return {
      name: s.name,
      runCount: s._count,
      totalTests,
      passed,
      failed,
      skipped,
      passRate: totalTests > 0 ? Math.round((passed / totalTests) * 1000) / 10 : 0,
      avgDuration: s._avg.duration ? Math.round(s._avg.duration) : null,
    };
  });

  return NextResponse.json({ suites });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle,
  XCircle,
  SkipForward,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { PassRateLine } from "@/features/dashboard/components/pass-rate-line";
import { SuiteBarChart } from "@/features/dashboard/components/suite-bar-chart";
import { StatusPieChart } from "@/features/dashboard/components/status-pie-chart";
import type { DashboardOverview } from "@/features/dashboard/types";

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardOverview>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard?days=30");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const overview = data ?? {
    totalRuns: 0,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    avgPassRate: 0,
    recentRuns: [],
    dailyTrend: [],
    suiteBreakdown: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Robot Framework test execution overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Runs"
          value={overview.totalRuns}
          icon={Activity}
        />
        <StatCard
          title="Passed"
          value={overview.totalPassed}
          icon={CheckCircle}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Failed"
          value={overview.totalFailed}
          icon={XCircle}
          iconClassName="text-destructive"
        />
        <StatCard
          title="Skipped"
          value={overview.totalSkipped}
          icon={SkipForward}
        />
        <StatCard
          title="Avg Pass Rate"
          value={`${overview.avgPassRate}%`}
          icon={TrendingUp}
          iconClassName="text-green-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PassRateLine data={overview.dailyTrend} />
        <StatusPieChart
          passed={overview.totalPassed}
          failed={overview.totalFailed}
          skipped={overview.totalSkipped}
        />
      </div>

      <SuiteBarChart data={overview.suiteBreakdown} />
    </div>
  );
}

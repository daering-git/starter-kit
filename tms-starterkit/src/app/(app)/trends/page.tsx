"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle,
  XCircle,
  SkipForward,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/common/stat-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { TrendLineChart } from "@/features/dashboard/components/trend-line-chart";
import { TrendBarChart } from "@/features/dashboard/components/trend-bar-chart";
import type { TrendDataPoint } from "@/features/dashboard/types";

interface TrendSummary {
  runs: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
}

export default function TrendsPage() {
  const [days, setDays] = useState("30");

  const { data, isLoading } = useQuery<{
    trend: TrendDataPoint[];
    summary: TrendSummary;
  }>({
    queryKey: ["trends", days],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/trends?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch trends");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const trend = data?.trend ?? [];
  const summary = data?.summary ?? {
    runs: 0,
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    passRate: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
          <p className="text-muted-foreground">
            Pass rate and test execution trends over time
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Runs"
          value={summary.runs}
          icon={Activity}
        />
        <StatCard
          title="Passed"
          value={summary.passed}
          icon={CheckCircle}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Failed"
          value={summary.failed}
          icon={XCircle}
          iconClassName="text-destructive"
        />
        <StatCard
          title="Skipped"
          value={summary.skipped}
          icon={SkipForward}
        />
        <StatCard
          title="Pass Rate"
          value={`${summary.passRate}%`}
          icon={TrendingUp}
          iconClassName="text-green-500"
        />
      </div>

      <TrendLineChart data={trend} />
      <TrendBarChart data={trend} />
    </div>
  );
}

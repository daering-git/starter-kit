"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/data-table";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { SuiteBarChart } from "@/features/dashboard/components/suite-bar-chart";
import type { SuiteAnalysis } from "@/features/dashboard/types";

const columns: ColumnDef<SuiteAnalysis>[] = [
  {
    accessorKey: "name",
    header: "Suite Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "runCount",
    header: "Runs",
  },
  {
    accessorKey: "totalTests",
    header: "Total Tests",
  },
  {
    accessorKey: "passed",
    header: "Passed",
    cell: ({ row }) => (
      <span className="text-green-600 dark:text-green-400">
        {row.getValue<number>("passed")}
      </span>
    ),
  },
  {
    accessorKey: "failed",
    header: "Failed",
    cell: ({ row }) => {
      const val = row.getValue<number>("failed");
      return (
        <span className={val > 0 ? "text-destructive font-medium" : ""}>
          {val}
        </span>
      );
    },
  },
  {
    accessorKey: "skipped",
    header: "Skipped",
  },
  {
    accessorKey: "passRate",
    header: "Pass Rate",
    cell: ({ row }) => {
      const rate = row.getValue<number>("passRate");
      return (
        <Badge variant={rate >= 90 ? "default" : rate >= 70 ? "secondary" : "destructive"}>
          {rate}%
        </Badge>
      );
    },
  },
  {
    accessorKey: "avgDuration",
    header: "Avg Duration",
    cell: ({ row }) => {
      const ms = row.getValue<number | null>("avgDuration");
      if (ms == null) return "-";
      if (ms < 1000) return `${ms}ms`;
      return `${(ms / 1000).toFixed(1)}s`;
    },
  },
];

export default function SuitesPage() {
  const { data, isLoading } = useQuery<{ suites: SuiteAnalysis[] }>({
    queryKey: ["suites"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/suites");
      if (!res.ok) throw new Error("Failed to fetch suites");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const suites = data?.suites ?? [];

  // Prepare bar chart data (top 10)
  const barData = suites.slice(0, 10).map((s) => ({
    name: s.name,
    passed: s.passed,
    failed: s.failed,
    skipped: s.skipped,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suite Analysis</h1>
        <p className="text-muted-foreground">
          Per-suite test result breakdown across all runs
        </p>
      </div>

      <SuiteBarChart data={barData} />

      <DataTable columns={columns} data={suites} />
    </div>
  );
}

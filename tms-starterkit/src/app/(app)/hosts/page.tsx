"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/common/data-table";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { HostHeatmap } from "@/features/dashboard/components/host-heatmap";
import type { HostHeatmapRow, HostSummary } from "@/features/dashboard/types";

const summaryColumns: ColumnDef<HostSummary>[] = [
  {
    accessorKey: "host",
    header: "Host",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("host")}</span>
      </div>
    ),
  },
  {
    accessorKey: "totalRuns",
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
    accessorKey: "lastRun",
    header: "Last Run",
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>("lastRun"));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

export default function HostsPage() {
  const [days, setDays] = useState("30");

  const { data, isLoading } = useQuery<{
    heatmap: HostHeatmapRow[];
    summaries: HostSummary[];
    dates: string[];
  }>({
    queryKey: ["hosts", days],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/hosts?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch hosts");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const heatmap = data?.heatmap ?? [];
  const summaries = data?.summaries ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Host Analysis</h1>
          <p className="text-muted-foreground">
            Pass rate heatmap by host and date
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

      <HostHeatmap data={heatmap} />

      <DataTable columns={summaryColumns} data={summaries} />
    </div>
  );
}

"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { TestRunSummary } from "../types";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = (seconds % 60).toFixed(0);
  return `${minutes}m ${remainSeconds}s`;
}

function passRate(passed: number, total: number): string {
  if (total === 0) return "—";
  return `${((passed / total) * 100).toFixed(1)}%`;
}

export const runsColumns: ColumnDef<TestRunSummary>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/runs/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "host",
    header: "Host",
    cell: ({ row }) => row.original.host ?? "—",
  },
  {
    accessorKey: "startedAt",
    header: "Started",
    cell: ({ row }) =>
      format(new Date(row.original.startedAt), "yyyy-MM-dd HH:mm"),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => formatDuration(row.original.duration),
  },
  {
    id: "results",
    header: "Results",
    cell: ({ row }) => {
      const { passed, failed, skipped, total } = row.original;
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-green-600 border-green-300">
            {passed}
          </Badge>
          <Badge variant="outline" className="text-destructive border-destructive/30">
            {failed}
          </Badge>
          {skipped > 0 && (
            <Badge variant="outline">{skipped}</Badge>
          )}
          <span className="ml-1 text-xs text-muted-foreground">
            / {total}
          </span>
        </div>
      );
    },
  },
  {
    id: "passRate",
    header: "Pass Rate",
    cell: ({ row }) => passRate(row.original.passed, row.original.total),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={status === "COMPLETED" ? "default" : "destructive"}
        >
          {status}
        </Badge>
      );
    },
  },
];

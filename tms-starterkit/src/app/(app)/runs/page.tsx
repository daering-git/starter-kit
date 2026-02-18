"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/common/data-table";
import { runsColumns } from "@/features/runs/components/runs-columns";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import type { TestRunSummary } from "@/features/runs/types";

export default function RunsPage() {
  const { data: runs, isLoading } = useQuery<TestRunSummary[]>({
    queryKey: ["runs"],
    queryFn: async () => {
      const res = await fetch("/api/runs");
      if (!res.ok) throw new Error("Failed to fetch runs");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Runs</h1>
        <p className="text-muted-foreground">
          All uploaded Robot Framework test execution results
        </p>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable columns={runsColumns} data={runs ?? []} />
      )}
    </div>
  );
}

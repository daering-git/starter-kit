"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  CheckCircle,
  XCircle,
  SkipForward,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/common/stat-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import type { TestRunDetail } from "@/features/runs/types";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = (seconds % 60).toFixed(0);
  return `${minutes}m ${remainSeconds}s`;
}

const statusColors: Record<string, string> = {
  PASS: "text-green-600",
  FAIL: "text-destructive",
  SKIP: "text-muted-foreground",
};

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: run, isLoading } = useQuery<TestRunDetail>({
    queryKey: ["run", id],
    queryFn: async () => {
      const res = await fetch(`/api/runs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch run");
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!run) return <p>Run not found.</p>;

  const passRate =
    run.total > 0 ? ((run.passed / run.total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{run.name}</h1>
        <p className="text-muted-foreground">
          {format(new Date(run.startedAt), "yyyy-MM-dd HH:mm:ss")}
          {run.host && ` · ${run.host}`}
          {` · ${run.source}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total"
          value={run.total}
          icon={Activity}
        />
        <StatCard
          title="Passed"
          value={run.passed}
          icon={CheckCircle}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Failed"
          value={run.failed}
          icon={XCircle}
          iconClassName="text-destructive"
        />
        <StatCard
          title="Skipped"
          value={run.skipped}
          icon={SkipForward}
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          description={formatDuration(run.duration)}
          icon={Clock}
        />
      </div>

      {run.suites.map((suite) => (
        <Card key={suite.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{suite.name}</span>
              <div className="flex gap-1">
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-300"
                >
                  {suite.passed} passed
                </Badge>
                <Badge
                  variant="outline"
                  className="text-destructive border-destructive/30"
                >
                  {suite.failed} failed
                </Badge>
                {suite.skipped > 0 && (
                  <Badge variant="outline">
                    {suite.skipped} skipped
                  </Badge>
                )}
              </div>
            </CardTitle>
            {suite.source && (
              <CardDescription>{suite.source}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suite.tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>
                      <span className={statusColors[test.status] ?? ""}>
                        {test.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDuration(test.duration)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {test.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {test.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

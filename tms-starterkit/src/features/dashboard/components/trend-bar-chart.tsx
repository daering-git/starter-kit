"use client";

import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendDataPoint } from "../types";

interface TrendBarChartProps {
  data: TrendDataPoint[];
}

export function TrendBarChart({ data }: TrendBarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Nivo BarDatum requires [key: string]: string | number index signature
  const barData = data.map((d) => ({
    date: d.date,
    passed: d.passed,
    failed: d.failed,
    skipped: d.skipped,
  })) as unknown as Record<string, string | number>[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          {data.length > 0 ? (
            <ResponsiveBar
              data={barData}
              keys={["passed", "failed", "skipped"]}
              indexBy="date"
              margin={{ top: 10, right: 20, bottom: 50, left: 50 }}
              padding={0.3}
              groupMode="stacked"
              colors={["hsl(142, 76%, 36%)", "hsl(0, 84%, 60%)", "#a1a1aa"]}
              axisBottom={{
                tickRotation: -45,
                legend: "Date",
                legendOffset: 40,
              }}
              axisLeft={{
                legend: "Tests",
                legendOffset: -40,
              }}
              labelSkipWidth={16}
              labelSkipHeight={16}
              theme={{
                text: { fill: isDark ? "#a1a1aa" : "#71717a" },
                axis: {
                  ticks: { text: { fill: isDark ? "#a1a1aa" : "#71717a" } },
                  legend: { text: { fill: isDark ? "#d4d4d8" : "#52525b" } },
                },
                grid: {
                  line: { stroke: isDark ? "#27272a" : "#e4e4e7" },
                },
                tooltip: {
                  container: {
                    background: isDark ? "#18181b" : "#ffffff",
                    color: isDark ? "#fafafa" : "#09090b",
                    border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                  },
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No test results available for the selected period.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

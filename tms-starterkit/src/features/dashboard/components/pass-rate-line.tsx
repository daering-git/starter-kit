"use client";

import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyTrendPoint } from "../types";

interface PassRateLineProps {
  data: DailyTrendPoint[];
}

export function PassRateLine({ data }: PassRateLineProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartData = [
    {
      id: "Pass Rate",
      data: data.map((d) => ({ x: d.date, y: d.passRate })),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pass Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveLine
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: 100 }}
              axisBottom={{
                tickRotation: -45,
                legendOffset: 40,
                legend: "Date",
              }}
              axisLeft={{
                legend: "Pass Rate (%)",
                legendOffset: -40,
              }}
              colors={["hsl(142, 76%, 36%)"]}
              pointSize={8}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea
              areaOpacity={0.1}
              useMesh
              theme={{
                text: { fill: isDark ? "#a1a1aa" : "#71717a" },
                axis: {
                  ticks: { text: { fill: isDark ? "#a1a1aa" : "#71717a" } },
                  legend: { text: { fill: isDark ? "#d4d4d8" : "#52525b" } },
                },
                grid: {
                  line: { stroke: isDark ? "#27272a" : "#e4e4e7" },
                },
                crosshair: {
                  line: { stroke: isDark ? "#71717a" : "#a1a1aa" },
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
              No trend data yet. Upload test results to see trends.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

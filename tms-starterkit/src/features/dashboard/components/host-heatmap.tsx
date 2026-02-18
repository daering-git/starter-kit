"use client";

import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HostHeatmapRow } from "../types";

interface HostHeatmapProps {
  data: HostHeatmapRow[];
}

export function HostHeatmap({ data }: HostHeatmapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Filter out cells with no data (-1) for color scale purposes
  // Nivo heatmap expects { id, data: [{ x, y }] }
  const chartData = data.map((row) => ({
    id: row.id,
    data: row.data.map((cell) => ({
      x: cell.x,
      y: cell.y === -1 ? null : cell.y,
    })),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Host Pass Rate Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="w-full overflow-x-auto"
          style={{ height: Math.max(200, data.length * 40 + 80) }}
        >
          {data.length > 0 ? (
            <ResponsiveHeatMap
              data={chartData}
              margin={{ top: 30, right: 20, bottom: 60, left: 120 }}
              valueFormat={(v) =>
                v === null ? "N/A" : `${v}%`
              }
              axisTop={{
                tickSize: 0,
                tickPadding: 5,
                tickRotation: -45,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 5,
              }}
              axisBottom={null}
              colors={{
                type: "diverging",
                scheme: "red_yellow_green",
                divergeAt: 0.5,
                minValue: 0,
                maxValue: 100,
              }}
              emptyColor={isDark ? "#27272a" : "#f4f4f5"}
              borderRadius={2}
              borderWidth={1}
              borderColor={isDark ? "#3f3f46" : "#e4e4e7"}
              labelTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
              legends={[
                {
                  anchor: "bottom",
                  translateX: 0,
                  translateY: 40,
                  length: 200,
                  thickness: 10,
                  direction: "row",
                  tickPosition: "after",
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  title: "Pass Rate %",
                  titleAlign: "start",
                  titleOffset: 4,
                },
              ]}
              theme={{
                text: { fill: isDark ? "#a1a1aa" : "#71717a" },
                axis: {
                  ticks: {
                    text: {
                      fill: isDark ? "#a1a1aa" : "#71717a",
                      fontSize: 11,
                    },
                  },
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
              No host data yet. Upload test results with host metadata.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { ResponsivePie } from "@nivo/pie";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusPieChartProps {
  passed: number;
  failed: number;
  skipped: number;
}

export function StatusPieChart({ passed, failed, skipped }: StatusPieChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const total = passed + failed + skipped;

  const data = [
    { id: "Passed", label: "Passed", value: passed, color: "hsl(142, 76%, 36%)" },
    { id: "Failed", label: "Failed", value: failed, color: "hsl(0, 84%, 60%)" },
    { id: "Skipped", label: "Skipped", value: skipped, color: "#a1a1aa" },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {total > 0 ? (
            <ResponsivePie
              data={data}
              margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ datum: "data.color" }}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsTextColor={isDark ? "#a1a1aa" : "#71717a"}
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              theme={{
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
              No test data yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

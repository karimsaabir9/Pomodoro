"use client";
import { useState } from "react";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  count: {
    label: "Sessions",
    color: "var(--chart-1)"
  },
} satisfies ChartConfig

export const StatsPanel = () => {
  const [range, setRange] = useState<"week" | "month">("week");
  const trpc = useTRPC();

  const {data: todayCount} = useSuspenseQuery(trpc.sessions.todayCount.queryOptions());
  const {data: streak} = useSuspenseQuery(trpc.sessions.streak.queryOptions());
  const {data: stats} = useSuspenseQuery(trpc.sessions.stats.queryOptions(range, {
    placeholderData: (prev) => prev,
  }));

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric"});
  };

  const chartData = stats.map(s => ({
    date: formatDate(s.date),
    count: s.count
  }));

  return (
    <div className="space-y-4 w-full">
      <h2 className="font-semibold text-lg">
        Statistics
      </h2>
      <div className="flex items-center gap-4">
        <TodaySummary count={todayCount}/>
        <StreakBadge streak={streak}/>
      </div>
      <Tabs value={range} onValueChange={(v) => setRange(v as "week" | "month")}>
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No sessions yet. Compelte a pomodoro to see your stats
        </p>
      ): (
        <ChartContainer
          config={CHART_CONFIG}
          className="h-50 w-full"
        >
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false}/>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={30}
            />
            <Tooltip
              cursor={{fill: "var(--muted)"}}
              content={({active, payload, label}) => {
                if(!active || !payload?.length) return null;

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-xs text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-medium">
                      {payload[0].value} {Number(payload[0].value) === 1 ? "session": "sessions"}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};

const TodaySummary = ({ count }: { count: number }) => (
  <div className="rounded-lg border p-3 flex-1">
    <p className="text-xs text-muted-foreground">Today</p>
    <p className="text-2xl font-bold tabular-nums">{count}</p>
    <p className="text-xs text-muted-foreground">
      {count === 1 ? "session" : "sessions"}
    </p>
  </div>
);

const StreakBadge = ({streak}: { streak: number }) => (
  <div className="rounded-lg border p-3 flex-1">
    <p className="text-xs text-muted-foreground">Streak</p>
    <div className="flex items-center gap-1">
      <p className="text-2xl font-bold tabular-nums">{streak}</p>
      {streak > 0 && <Flame className="size-5 text-orange-500" />}
    </div>
    <p className="text-xs text-muted-foreground">
      {streak === 1 ? "day" : "days"}
    </p>
  </div>
)
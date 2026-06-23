"use client";

import { DEFAULT_SETTINGS } from "@/lib/constants";
import { useTimer } from "@/lib/timer-context";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const SessionIndicator = () => {
  const {state} = useTimer();
  const trpc = useTRPC();
  const {data: settings} = useQuery(trpc.settings.get.queryOptions());

  const total = settings?.sessionsBeforeLongBreak ?? DEFAULT_SETTINGS.sessionsBeforeLongBreak;
  const current = state.currentSessionNumber;

  return (
    <div className="flex items-center gap-2">
      {Array.from({length: total}, (_, i) => {
        const sessionNum = i + 1;
        const isCompleted = sessionNum < current;
        const isCurrent = sessionNum === current;

        return (
          <div
            className={`size-4 rounded-full transition-colors ${
              isCompleted ? 
                "bg-red-500": isCurrent ?
                  state.mode === "work" ? 
                    "bg-red-500/60 ring-2 ring-red-500/30":
                    "bg-red-500":
                  "bg-muted"
              }`}
            key={i}
          >
          </div>
        )
      })}
      <span className="text-xs text-muted-foreground ml-1">
        {current}/{total}
      </span>
    </div>
  );
};
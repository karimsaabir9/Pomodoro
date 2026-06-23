"use client";

import { useTimer } from "@/lib/timer-context"
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const ActiveTaskLabel = () => {
  const {state} = useTimer();
  const trpc = useTRPC();

  const {data: tasks} = useQuery(trpc.tasks.list.queryOptions());

  if(!state.activeTaskId) return null;

  const task = tasks?.find(t => t.id === state.activeTaskId);

  if(!task) return null;

  return (
    <div className="text-sm text-muted-foreground text-center">
      Working on: <span className="font-medium text-foreground">{task.title}</span>
    </div>
  );
};
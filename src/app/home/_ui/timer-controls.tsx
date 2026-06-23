"use client";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTimer } from "@/lib/timer-context";

export const TimerControls = () => {
  const {state, start, pause, reset} = useTimer();

  return (
    <div className="flex items-center gap-3">
      {state.isRunning ? (
        <Button onClick={pause} size="lg" variant="outline">
          <Pause className="size-5"/>
          Pause
        </Button>
      ): (
        <Button onClick={start} size="lg">
          <Play className="size-5"/>
          Play
        </Button>
      )}
      <Button onClick={reset} size="lg" variant="ghost">
        <RotateCcw className="size-5"/>
        Reset
      </Button>
    </div>
  );
};
"use client";
import { useTimer } from "@/lib/timer-context";

const SIZE = 256;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CircularTimer = () => {
  const {state} = useTimer();

  const progress = state.totalTime > 0 ? state.timeRemaining / state.totalTime: 1;

  const offset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const color =
    state.mode === "work" ? 
      "stroke-red-500": state.mode === "short_break" ?
        "stroke-green-500":
          "stroke-blue-500";

  const textColor = 
    state.mode === "work" ? 
      "text-red-500": state.mode === "short_break" ?
        "text-green-500":
          "text-blue-500";

  return (
    <div className="flex items-center justify-center relative">
      <svg className="-rotate-90" height={SIZE} width={SIZE}>
        <circle
          cx={SIZE/2}
          cy={SIZE/2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-muted"
        />
        <circle
          cx={SIZE/2}
          cy={SIZE/2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${color} transition-[stroke-dashoffset] duration-1000 ease-linear`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-mono font-bold tabular-nums ${textColor}`}>
          {timeStr}
        </span>
        <span className="text-sm text-muted-foreground mt-1 capitalize">
          {state.mode.replace("_", " ")}
        </span>
      </div>
    </div>
  );
};
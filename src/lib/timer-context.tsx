"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useEffect, useReducer, useRef } from "react";
import { DEFAULT_SETTINGS } from "./constants";

type TimerMode = "work" | "short_break" | "long_break";

interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  currentSessionNumber: number;
  activeTaskId: string | null;
}

type TimerAction =
  | { type: "TICK" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET"; totalTime: number }
  | {
      type: "COMPLETE";
      nextMode: TimerMode;
      nextTime: number;
      nextSession: number;
    }
  | { type: "SET_TASK"; taskId: string | null }
  | { type: "SET_MODE"; mode: TimerMode; totalTime: number };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "TICK":
      if (state.timeRemaining <= 1) {
        return { ...state, timeRemaining: 0, isRunning: false };
      }
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    case "START":
      return { ...state, isRunning: true };
    case "PAUSE":
      return { ...state, isRunning: false };
    case "RESET":
      return {
        ...state,
        timeRemaining: action.totalTime,
        totalTime: action.totalTime,
        isRunning: false,
      };
    case "COMPLETE":
      return {
        ...state,
        mode: action.nextMode,
        timeRemaining: action.nextTime,
        totalTime: action.nextTime,
        currentSessionNumber: action.nextSession,
        isRunning: false,
      };
    case "SET_TASK":
      return { ...state, activeTaskId: action.taskId };
    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        timeRemaining: action.totalTime,
        totalTime: action.totalTime,
        isRunning: false,
      };
    default:
      return state;
  }
}

interface TimerContextValue {
  state: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setActiveTask: (taskId: string | null) => void;
  setMode: (mode: TimerMode) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);
export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const trpc = useTRPC();

  const { data: settings } = useSuspenseQuery(trpc.settings.get.queryOptions());

  const workDuration = settings?.workDuration ?? DEFAULT_SETTINGS.workDuration;
  const shortBreakDuration =
    settings?.shortBreakDuration ?? DEFAULT_SETTINGS.shortBreakDuration;
  const longBreakDuration =
    settings?.longBreakDuration ?? DEFAULT_SETTINGS.longBreakDuration;
  const sessionsBeforeLongBreak =
    settings?.sessionsBeforeLongBreak ??
    DEFAULT_SETTINGS.sessionsBeforeLongBreak;
  const soundEnabled = settings?.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled;
  const notificationsEnabled =
    settings?.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled;

  const [state, dispatch] = useReducer(timerReducer, {
    mode: "work",
    timeRemaining: workDuration * 60,
    totalTime: workDuration * 60,
    isRunning: false,
    currentSessionNumber: 1,
    activeTaskId: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const settingsRef = useRef({
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    soundEnabled,
    notificationsEnabled,
  });
  settingsRef.current = {
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    soundEnabled,
    notificationsEnabled,
  };
  const prevWorkRef = useRef(workDuration);
  useEffect(() => {
    if (
      !state.isRunning &&
      state.mode === "work" &&
      prevWorkRef.current !== workDuration
    ) {
      dispatch({ type: "RESET", totalTime: workDuration * 60 });
    }
    prevWorkRef.current = workDuration;
  }, [workDuration, state.isRunning, state.mode]);
};

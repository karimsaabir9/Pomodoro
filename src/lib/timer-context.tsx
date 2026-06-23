"use client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { DEFAULT_SETTINGS } from "./constants";
import { playNotificationSound } from "./audio";
import { toast } from "sonner";

type TimerMode = "work" | "short_break"| "long_break";

interface TimerState {
  mode: TimerMode;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  currentSessionNumber: number;
  activeTaskId: string | null;
};

type TimerAction =
  | { type: "TICK" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET"; totalTime: number }
  | { type: "COMPLETE"; nextMode: TimerMode; nextTime: number; nextSession: number }
  | { type: "SET_TASK"; taskId: string | null }
  | { type: "SET_MODE"; mode: TimerMode; totalTime: number };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch(action.type) {
    case "TICK":
      if(state.timeRemaining <= 1) {
        return {...state, timeRemaining: 0, isRunning: false}
      }
      return {...state, timeRemaining: state.timeRemaining - 1};
    case "START":
      return {...state, isRunning: true};
    case "PAUSE":
      return {...state, isRunning: false};
    case "RESET":
      return {...state, timeRemaining: action.totalTime, totalTime: action.totalTime, isRunning: false};
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
      return {...state, activeTaskId: action.taskId};
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
  };
};

interface TimerContextValue {
  state: TimerState,
  start: () => void;
  pause: () => void;
  reset: () => void;
  setActiveTask: (taskId: string | null) => void;
  setMode: (mode: TimerMode) => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export const TimerProvider = ({children}: {children: React.ReactNode}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: settings } = useSuspenseQuery(trpc.settings.get.queryOptions());

  const createSession = useMutation(
    trpc.sessions.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: trpc.sessions.todayCount.queryKey()});
        queryClient.invalidateQueries({queryKey: trpc.sessions.stats.queryKey()});
        queryClient.invalidateQueries({queryKey: trpc.sessions.streak.queryKey()});
      },
      onError: () => toast.error("Failed to save session."),
    })
  );

  const incrementPomodoro = useMutation(
    trpc.tasks.incrementPomodoro.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({queryKey: trpc.tasks.list.queryKey()}),
      onError: () => toast.error("Failed to update task."),
    })
  );

  const workDuration = settings.workDuration;
  const shortBreakDuration = settings.shortBreakDuration;
  const longBreakDuration = settings.longBreakDuration;
  const sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
  const soundEnabled = settings.soundEnabled;
  const notificationsEnabled = settings.notificationsEnabled;

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
    if(!state.isRunning && state.mode === "work" && prevWorkRef.current !== workDuration) {
      dispatch({type: "RESET", totalTime: workDuration * 60});
    }
    prevWorkRef.current = workDuration;
  }, [workDuration, state.isRunning, state.mode]);

  const handleTimerComplete = useCallback(() => {
    const sR = stateRef.current;
    const cfg = settingsRef.current;

    if(cfg.soundEnabled) {
      playNotificationSound();
    }

    if(cfg.notificationsEnabled && typeof Notification !== "undefined" && Notification.permission === "granted") {
      const message = sR.mode ==="work" ? "Work session complete! Time for a break": "Break is over! Get ready to focus.";
      new Notification("NextTimer", {body: message});
    }

    // Log session to db
    createSession.mutate({
      taskId: sR.activeTaskId,
      duration: sR.mode === "work" ? cfg.workDuration: sR.mode === "short_break" ? cfg.shortBreakDuration: cfg.longBreakDuration,
      type: sR.mode,
    });
    // Increment task count
    if(sR.mode === "work" && sR.activeTaskId) {
      incrementPomodoro.mutate({ id: sR.activeTaskId})
    }

    let nextMode: TimerMode;
    let nextSession = sR.currentSessionNumber;

    if (sR.mode === "work") {
      if(sR.currentSessionNumber % cfg.sessionsBeforeLongBreak === 0) {
        nextMode = "long_break";
      } else {
        nextMode = "short_break";
      }
      toast.success("Work session complete! Time for a break!");
    } else {
      nextMode = "work";
      nextSession = sR.mode === "long_break" ? 1: sR.currentSessionNumber + 1;
    }

    const nextTime = nextMode === "work" ? cfg.workDuration * 60:
      nextMode === "short_break" ? cfg.shortBreakDuration * 60:
        cfg.longBreakDuration * 60;
    dispatch({
      type: "COMPLETE",
      nextMode,
      nextTime,
      nextSession,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown Interval
  useEffect(() => {
    if(!state.isRunning) return;

    const interval = setInterval(() => {
      dispatch({type: "TICK"});
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  useEffect(() => {
    if(state.timeRemaining === 0 && !state.isRunning) {
      if(state.totalTime > 0) {
        handleTimerComplete();
      }
    }
  }, [state.timeRemaining, state.isRunning, state.totalTime, handleTimerComplete]);

  useEffect(() => {
    if(typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const modeStr = state.mode === "work" ? "Work": state.mode === "short_break" ? "Short Break": "Long Break";
    document.title = `${timeStr} - ${modeStr} | NextTimer`;

    return () => { document.title = "NextTimer" };
  }, [state.timeRemaining, state.mode]);

  const getDurationForMode = useCallback(
    (mode: TimerMode) => {
      return mode === "work" ? workDuration * 60:
        mode === "short_break" ? shortBreakDuration * 60:
          longBreakDuration * 60;
    }, [workDuration, shortBreakDuration, longBreakDuration]
  );

  const value: TimerContextValue = {
    state,
    start: () => dispatch({type: "START"}),
    pause: () => dispatch({type: "PAUSE"}),
    reset: () => dispatch({type: "RESET", totalTime: getDurationForMode(state.mode)}),
    setActiveTask: (taskId) => dispatch({type: "SET_TASK", taskId}),
    setMode: (mode) => dispatch({type: "SET_MODE", mode, totalTime: getDurationForMode(mode)}),
  };

  return <TimerContext value={value}>{children}</TimerContext>;
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if(!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
};
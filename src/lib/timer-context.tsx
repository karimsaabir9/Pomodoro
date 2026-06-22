
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
    
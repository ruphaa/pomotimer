import {
  DEFAULT_DURATIONS,
  TIMER_LIMITS,
  clampEditedMinutes,
  nextMode,
  type Durations,
  type Mode,
} from "@pomotimer/core";
import { Store } from "@tanstack/store";

export interface TimerState {
  mode: Mode;
  running: boolean;
  /** Remaining seconds in the current session. */
  secondsLeft: number;
  durations: Durations;
  /** Number of focus rounds completed in this session. */
  round: number;
  /** UI: whether the timer numerals are in edit mode. */
  editingTimer: boolean;
}

export const initialTimerState: TimerState = {
  mode: "pomodoro",
  running: false,
  secondsLeft: DEFAULT_DURATIONS.pomodoro,
  durations: DEFAULT_DURATIONS,
  round: 1,
  editingTimer: false,
};

export function createTimerStore(initial?: Partial<TimerState>) {
  const store = new Store<TimerState>({ ...initialTimerState, ...initial });

  const setMode = (mode: Mode) => {
    store.setState((s) => ({
      ...s,
      mode,
      running: false,
      secondsLeft: s.durations[mode],
    }));
  };

  const start = () => store.setState((s) => ({ ...s, running: true }));
  const pause = () => store.setState((s) => ({ ...s, running: false }));
  const toggle = () => store.setState((s) => ({ ...s, running: !s.running }));

  const reset = () =>
    store.setState((s) => ({
      ...s,
      running: false,
      secondsLeft: s.durations[s.mode],
    }));

  /** Move to the next sensible mode without logging completion. */
  const skip = () =>
    store.setState((s) => {
      const completedFocus =
        s.mode === "pomodoro" ? s.round : s.round - 1 < 1 ? 0 : s.round - 1;
      const target = nextMode(s.mode, Math.max(1, completedFocus));
      return {
        ...s,
        mode: target,
        running: false,
        secondsLeft: s.durations[target],
      };
    });

  /** Tick by one second; returns `true` if the session just completed. */
  const tick = (): boolean => {
    let completed = false;
    store.setState((s) => {
      if (!s.running) return s;
      if (s.secondsLeft <= 1) {
        completed = true;
        return { ...s, secondsLeft: 0, running: false };
      }
      return { ...s, secondsLeft: s.secondsLeft - 1 };
    });
    return completed;
  };

  /** Called by the engine after a session hits 0 to advance to the next mode. */
  const advanceAfterCompletion = () => {
    store.setState((s) => {
      const completedFocus = s.mode === "pomodoro" ? s.round : s.round;
      const target = nextMode(s.mode, completedFocus);
      const nextRound = s.mode === "pomodoro" ? s.round + 1 : s.round;
      return {
        ...s,
        mode: target,
        running: false,
        secondsLeft: s.durations[target],
        round: nextRound,
      };
    });
  };

  /** Commit an edited duration (in raw user input). Updates the active mode. */
  const commitEditedMinutes = (raw: string) => {
    const minutes = clampEditedMinutes(raw);
    const seconds = minutes * 60;
    store.setState((s) => ({
      ...s,
      editingTimer: false,
      durations: { ...s.durations, [s.mode]: seconds },
      secondsLeft: seconds,
      running: false,
    }));
  };

  const setEditingTimer = (editing: boolean) =>
    store.setState((s) => ({ ...s, editingTimer: editing }));

  return {
    store,
    setMode,
    start,
    pause,
    toggle,
    reset,
    skip,
    tick,
    advanceAfterCompletion,
    commitEditedMinutes,
    setEditingTimer,
  };
}

export type TimerStore = ReturnType<typeof createTimerStore>;

/** Minutes the active mode is configured for, used by the editable input. */
export function activeMinutes(state: TimerState): number {
  return Math.round(state.durations[state.mode] / 60);
}

export { TIMER_LIMITS };

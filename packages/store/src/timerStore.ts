import {
  DEFAULT_DURATIONS,
  TIMER_LIMITS,
  applyCompletion,
  clampEditedMinutes,
  computeSecondsLeft,
  type AppPersistedState,
  type Durations,
  type Mode,
} from "@pomotimer/core";
import { Store } from "@tanstack/store";

/**
 * Timer state uses an absolute `endsAt` deadline as the source of truth
 * for "running". This survives backgrounding (web tab throttling,
 * extension popup close) because no tick is required to advance the clock —
 * it advances naturally in wall-clock time.
 */
export interface TimerState {
  mode: Mode;
  durations: Durations;
  /** Number of focus rounds completed in the session. */
  round: number;
  /** Wall-clock ms when the running session ends. null when paused/stopped. */
  endsAt: number | null;
  /** Seconds remaining at the moment of the last pause/reset/setMode. */
  pausedSecondsLeft: number;
  /** UI: whether the timer numerals are in edit mode. */
  editingTimer: boolean;
}

export const initialTimerState: TimerState = {
  mode: "pomodoro",
  durations: DEFAULT_DURATIONS,
  round: 1,
  endsAt: null,
  pausedSecondsLeft: DEFAULT_DURATIONS.pomodoro,
  editingTimer: false,
};

export function createTimerStore(initial?: Partial<TimerState>) {
  const store = new Store<TimerState>({ ...initialTimerState, ...initial });

  const setMode = (mode: Mode) => {
    store.setState((s) => ({
      ...s,
      mode,
      endsAt: null,
      pausedSecondsLeft: s.durations[mode],
    }));
  };

  const start = () => {
    store.setState((s) => {
      if (s.endsAt != null) return s; // already running
      const remaining = Math.max(0, s.pausedSecondsLeft);
      if (remaining === 0) return s;
      return { ...s, endsAt: Date.now() + remaining * 1000 };
    });
  };

  const pause = () => {
    store.setState((s) => {
      if (s.endsAt == null) return s;
      return {
        ...s,
        endsAt: null,
        pausedSecondsLeft: computeSecondsLeft(s.endsAt, s.pausedSecondsLeft),
      };
    });
  };

  const toggle = () => {
    if (store.state.endsAt == null) start();
    else pause();
  };

  const reset = () =>
    store.setState((s) => ({
      ...s,
      endsAt: null,
      pausedSecondsLeft: s.durations[s.mode],
    }));

  /** Move to the next sensible mode without logging completion. */
  const skip = () =>
    store.setState((s) => {
      const completedFocus = s.mode === "pomodoro" ? s.round : Math.max(1, s.round - 1);
      const target =
        s.mode === "pomodoro"
          ? completedFocus % 4 === 0
            ? "long"
            : "short"
          : "pomodoro";
      return {
        ...s,
        mode: target,
        endsAt: null,
        pausedSecondsLeft: s.durations[target],
      };
    });

  /** Apply session-completion side effects to the runtime stores. */
  const advanceAfterCompletion = (
    /** Optional cross-store hooks fired before mode advances. */
    hooks?: {
      onFocusComplete?: (sessionSeconds: number) => void;
    },
  ) => {
    store.setState((s) => {
      if (s.mode === "pomodoro") {
        hooks?.onFocusComplete?.(s.durations.pomodoro);
      }
      const completedFocus = s.mode === "pomodoro" ? s.round : Math.max(1, s.round - 1);
      const target =
        s.mode === "pomodoro"
          ? completedFocus % 4 === 0
            ? "long"
            : "short"
          : "pomodoro";
      const nextRound = s.mode === "pomodoro" ? s.round + 1 : s.round;
      return {
        ...s,
        mode: target,
        round: nextRound,
        endsAt: null,
        pausedSecondsLeft: s.durations[target],
      };
    });
  };

  const commitEditedMinutes = (raw: string) => {
    const minutes = clampEditedMinutes(raw);
    const seconds = minutes * 60;
    store.setState((s) => ({
      ...s,
      editingTimer: false,
      durations: { ...s.durations, [s.mode]: seconds },
      endsAt: null,
      pausedSecondsLeft: seconds,
    }));
  };

  const setEditingTimer = (editing: boolean) =>
    store.setState((s) => ({ ...s, editingTimer: editing }));

  /** Replace state from a persisted snapshot. Used on hydrate + external sync.
   * Defensive: any missing/undefined field falls back to the current default
   * so a partial / older-schema blob in storage can't produce NaN downstream
   * (e.g. formatMmSs(undefined) → "NaN:NaN"). */
  const replaceFromPersisted = (
    persisted: Partial<
      Pick<
        AppPersistedState,
        "mode" | "durations" | "round" | "endsAt" | "pausedSecondsLeft"
      >
    >,
  ) => {
    store.setState((s) => {
      const mode = persisted.mode ?? s.mode;
      const durations = { ...s.durations, ...(persisted.durations ?? {}) };
      const pausedSecondsLeft =
        typeof persisted.pausedSecondsLeft === "number" &&
        Number.isFinite(persisted.pausedSecondsLeft)
          ? persisted.pausedSecondsLeft
          : durations[mode];
      return {
        ...s,
        mode,
        durations,
        round: persisted.round ?? s.round,
        endsAt:
          typeof persisted.endsAt === "number" ? persisted.endsAt : null,
        pausedSecondsLeft,
      };
    });
  };

  return {
    store,
    setMode,
    start,
    pause,
    toggle,
    reset,
    skip,
    advanceAfterCompletion,
    commitEditedMinutes,
    setEditingTimer,
    replaceFromPersisted,
    /** Re-export for completeness, in case background SWs need it. */
    applyCompletion,
  };
}

export type TimerStore = ReturnType<typeof createTimerStore>;

/** Minutes the active mode is configured for, used by the editable input. */
export function activeMinutes(state: TimerState): number {
  return Math.round(state.durations[state.mode] / 60);
}

/** Pure selector: is the timer currently running? */
export function isRunning(state: TimerState): boolean {
  return state.endsAt != null;
}

export { TIMER_LIMITS };

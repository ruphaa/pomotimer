import { nextMode } from "./engine";
import { isoDate } from "./time";
import type { AppPersistedState } from "./types";

/**
 * Pure transition: apply the side effects of a session reaching zero.
 *
 * - On focus completion: log a session and bump the active task's pomos.
 * - Always: advance to the next mode, increment round if focus, reset
 *   pausedSecondsLeft to the next mode's full duration, clear endsAt.
 *
 * Used by both the web `useTimerEngine` and the extension background
 * service worker so completion behavior is identical across surfaces.
 */
export function applyCompletion(state: AppPersistedState): AppPersistedState {
  const completedMode = state.mode;
  const completedFocusRounds =
    completedMode === "pomodoro" ? state.round : Math.max(1, state.round - 1);

  let tasks = state.tasks;
  let sessions = state.sessions;
  let round = state.round;

  if (completedMode === "pomodoro") {
    const sessionSeconds = state.durations.pomodoro;
    const active = state.tasks.find((t) => t.active && !t.done);
    sessions = [
      ...state.sessions,
      { date: isoDate(), seconds: sessionSeconds, taskId: active?.id },
    ];
    if (active) {
      tasks = state.tasks.map((t) =>
        t.id === active.id ? { ...t, pomos: t.pomos + 1 } : t,
      );
    }
    round = state.round + 1;
  }

  const target = nextMode(completedMode, completedFocusRounds);

  return {
    ...state,
    mode: target,
    round,
    endsAt: null,
    pausedSecondsLeft: state.durations[target],
    tasks,
    sessions,
  };
}

/** Compute live seconds-left from an endsAt timestamp. */
export function computeSecondsLeft(
  endsAt: number | null,
  pausedSecondsLeft: number,
  now: number = Date.now(),
): number {
  if (endsAt == null) return Math.max(0, pausedSecondsLeft);
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

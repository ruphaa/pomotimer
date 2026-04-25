export type Mode = "pomodoro" | "short" | "long";

/** Durations in seconds, keyed by mode. */
export interface Durations {
  pomodoro: number;
  short: number;
  long: number;
}

export const DEFAULT_DURATIONS: Durations = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export interface Task {
  id: string;
  text: string;
  done: boolean;
  /** Completed pomodoros for this task. */
  pomos: number;
  /** Estimated pomodoros (clamped >= 1). */
  est: number;
  /** Exactly one task should be active. */
  active: boolean;
  note?: string;
}

/** A single completed focus session, used to roll up stats. */
export interface SessionLog {
  /** ISO date string (yyyy-mm-dd) for the local day the session ended. */
  date: string;
  /** Seconds focused (full duration of the pomodoro on completion). */
  seconds: number;
  /** Task id, if a task was active when the session completed. */
  taskId?: string;
}

export interface AppPersistedState {
  mode: Mode;
  durations: Durations;
  round: number;
  /** Wall-clock ms when the active session ends; null when paused/stopped. */
  endsAt: number | null;
  /** Seconds remaining at the moment of last pause/reset/mode-switch. */
  pausedSecondsLeft: number;
  tasks: Task[];
  sessions: SessionLog[];
}

export const TIMER_LIMITS = {
  minMinutes: 1,
  maxMinutes: 180,
  /** Pomodoros before a long break. */
  longEvery: 4,
} as const;

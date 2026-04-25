import { isoDate, type SessionLog } from "@pomotimer/core";
import { Store } from "@tanstack/store";

export interface StatsState {
  sessions: SessionLog[];
}

export const initialStatsState: StatsState = { sessions: [] };

export function createStatsStore(initial?: Partial<StatsState>) {
  const store = new Store<StatsState>({ ...initialStatsState, ...initial });

  const logSession = (seconds: number, taskId?: string) =>
    store.setState((s) => ({
      ...s,
      sessions: [...s.sessions, { date: isoDate(), seconds, taskId }],
    }));

  return { store, logSession };
}

export type StatsStore = ReturnType<typeof createStatsStore>;

export interface DailyRollup {
  /** `yyyy-mm-dd`. */
  date: string;
  pomodoros: number;
  seconds: number;
}

/** Roll sessions up by date. */
export function rollupByDate(state: StatsState): Map<string, DailyRollup> {
  const map = new Map<string, DailyRollup>();
  for (const s of state.sessions) {
    const cur = map.get(s.date) ?? {
      date: s.date,
      pomodoros: 0,
      seconds: 0,
    };
    cur.pomodoros += 1;
    cur.seconds += s.seconds;
    map.set(s.date, cur);
  }
  return map;
}

/** Last 7 days including today, in chronological order. */
export function last7Days(state: StatsState, today: Date = new Date()) {
  const rollup = rollupByDate(state);
  const out: DailyRollup[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = isoDate(d);
    out.push(rollup.get(key) ?? { date: key, pomodoros: 0, seconds: 0 });
  }
  return out;
}

export function todayStats(state: StatsState): DailyRollup {
  const key = isoDate();
  return (
    rollupByDate(state).get(key) ?? {
      date: key,
      pomodoros: 0,
      seconds: 0,
    }
  );
}

/** Consecutive-day streak ending today (or yesterday). */
export function currentStreak(state: StatsState, today: Date = new Date()): number {
  const rollup = rollupByDate(state);
  let streak = 0;
  const cursor = new Date(today);
  // Allow today to be empty; start from yesterday in that case.
  if (!rollup.has(isoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (rollup.has(isoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

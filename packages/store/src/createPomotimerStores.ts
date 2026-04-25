import type { AppPersistedState, StorageAdapter } from "@pomotimer/core";

import { persistStore } from "./persist";
import { createStatsStore } from "./statsStore";
import { createTasksStore } from "./tasksStore";
import { createTimerStore } from "./timerStore";

const STORAGE_KEY = "pomotimer:v1";

export interface PomotimerStores {
  timer: ReturnType<typeof createTimerStore>;
  tasks: ReturnType<typeof createTasksStore>;
  stats: ReturnType<typeof createStatsStore>;
  /** Resolves once persisted state has been merged in. */
  hydrated: Promise<void>;
  /** Tear down all subscriptions. */
  dispose: () => void;
}

/**
 * Bundle the three stores + wire persistence to a single key in `storage`.
 * Persisted shape is intentionally narrow — UI flags (running, editingTimer,
 * newTaskDraft) are NOT persisted.
 */
export function createPomotimerStores(
  storage: StorageAdapter,
): PomotimerStores {
  const timer = createTimerStore();
  const tasks = createTasksStore();
  const stats = createStatsStore();

  const hydrated = (async () => {
    const persisted = await storage.get<AppPersistedState>(STORAGE_KEY);
    if (!persisted) return;
    if (persisted.durations) {
      timer.store.setState((s) => ({
        ...s,
        durations: persisted.durations,
        secondsLeft: persisted.durations[s.mode],
      }));
    }
    if (typeof persisted.round === "number") {
      timer.store.setState((s) => ({ ...s, round: persisted.round }));
    }
    if (Array.isArray(persisted.tasks)) {
      tasks.store.setState((s) => ({ ...s, tasks: persisted.tasks }));
    }
    if (Array.isArray(persisted.sessions)) {
      stats.store.setState((s) => ({ ...s, sessions: persisted.sessions }));
    }
  })();

  const writeBack = () => {
    const snapshot: AppPersistedState = {
      durations: timer.store.state.durations,
      round: timer.store.state.round,
      tasks: tasks.store.state.tasks,
      sessions: stats.store.state.sessions,
    };
    void storage.set(STORAGE_KEY, snapshot);
  };

  const unsubs = [
    timer.store.subscribe(writeBack),
    tasks.store.subscribe(writeBack),
    stats.store.subscribe(writeBack),
  ];

  return {
    timer,
    tasks,
    stats,
    hydrated,
    dispose: () => unsubs.forEach((u) => u()),
  };
}

// Suppress unused-warning when persistStore stays around for surface-specific
// callers. Re-exported for convenience.
export { persistStore };

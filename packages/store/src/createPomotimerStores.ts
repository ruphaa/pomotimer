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
 *
 * - Hydrates from the persisted blob on construction.
 * - Subscribes to in-memory store changes and writes back the full blob.
 * - If the storage adapter supports `subscribe`, also mirrors EXTERNAL
 *   writes (e.g. background service worker, other tab) back into the
 *   in-memory stores. Self-originating writes are de-duplicated by a
 *   serialized-snapshot comparison so we don't loop.
 */
export function createPomotimerStores(
  storage: StorageAdapter,
): PomotimerStores {
  const timer = createTimerStore();
  const tasks = createTasksStore();
  const stats = createStatsStore();

  let lastSerialized: string | null = null;

  const snapshot = (): AppPersistedState => ({
    mode: timer.store.state.mode,
    durations: timer.store.state.durations,
    round: timer.store.state.round,
    endsAt: timer.store.state.endsAt,
    pausedSecondsLeft: timer.store.state.pausedSecondsLeft,
    tasks: tasks.store.state.tasks,
    sessions: stats.store.state.sessions,
  });

  const applyPersisted = (persisted: AppPersistedState) => {
    timer.replaceFromPersisted(persisted);
    tasks.store.setState((s) => ({ ...s, tasks: persisted.tasks ?? [] }));
    stats.store.setState((s) => ({
      ...s,
      sessions: persisted.sessions ?? [],
    }));
  };

  const hydrated = (async () => {
    const persisted = await storage.get<AppPersistedState>(STORAGE_KEY);
    if (!persisted) {
      lastSerialized = JSON.stringify(snapshot());
      return;
    }
    applyPersisted(persisted);
    lastSerialized = JSON.stringify(persisted);
  })();

  const writeBack = () => {
    const next = snapshot();
    const serialized = JSON.stringify(next);
    if (serialized === lastSerialized) return;
    lastSerialized = serialized;
    void storage.set(STORAGE_KEY, next);
  };

  const unsubs: Array<() => void> = [
    timer.store.subscribe(writeBack),
    tasks.store.subscribe(writeBack),
    stats.store.subscribe(writeBack),
  ];

  // Mirror external changes in (e.g. BG service worker writes after the
  // alarm fires while the popup happens to be open).
  if (storage.subscribe) {
    const unsubExternal = storage.subscribe<AppPersistedState>(
      STORAGE_KEY,
      (value) => {
        if (!value) return;
        const serialized = JSON.stringify(value);
        if (serialized === lastSerialized) return;
        lastSerialized = serialized;
        applyPersisted(value);
      },
    );
    unsubs.push(unsubExternal);
  }

  return {
    timer,
    tasks,
    stats,
    hydrated,
    dispose: () => unsubs.forEach((u) => u()),
  };
}

export { persistStore };

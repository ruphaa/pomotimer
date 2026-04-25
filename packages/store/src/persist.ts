import type { StorageAdapter } from "@pomotimer/core";
import { Store } from "@tanstack/store";

/**
 * Wire a TanStack Store to a StorageAdapter:
 *  1. Hydrate from storage on first call (returns a promise the caller can await).
 *  2. Persist on every change.
 */
export function persistStore<T>(
  store: Store<T>,
  storage: StorageAdapter,
  key: string,
  /** Optional merge — useful when the persisted shape is partial. */
  merge: (persisted: Partial<T>, current: T) => T = (p, c) => ({
    ...c,
    ...p,
  }),
): { hydrated: Promise<void>; unsubscribe: () => void } {
  const hydrated = storage.get<Partial<T>>(key).then((persisted) => {
    if (persisted) {
      store.setState((current) => merge(persisted, current));
    }
  });

  const unsubscribe = store.subscribe(() => {
    void storage.set(key, store.state);
  });

  return { hydrated, unsubscribe };
}

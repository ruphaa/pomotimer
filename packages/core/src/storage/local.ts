import type { StorageAdapter } from "./adapter";

/**
 * `localStorage`-backed adapter. Safe to call in non-browser environments —
 * reads return `undefined` and writes are no-ops when `localStorage` is absent
 * (e.g. during SSR).
 */
export const localStorageAdapter: StorageAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    if (typeof localStorage === "undefined") return undefined;
    const raw = localStorage.getItem(key);
    if (raw == null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  },
};

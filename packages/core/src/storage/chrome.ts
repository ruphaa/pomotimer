import type { StorageAdapter } from "./adapter";

/**
 * `chrome.storage.local`-backed adapter for the extension popup.
 * Falls through to a no-op when running outside the extension runtime.
 */
declare const chrome:
  | {
      storage?: {
        local: {
          get(key: string): Promise<Record<string, unknown>>;
          set(items: Record<string, unknown>): Promise<void>;
          remove(key: string): Promise<void>;
        };
      };
    }
  | undefined;

export const chromeStorageAdapter: StorageAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    if (typeof chrome === "undefined" || !chrome.storage) return undefined;
    const result = await chrome.storage.local.get(key);
    return result[key] as T | undefined;
  },
  async set<T>(key: string, value: T): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage) return;
    await chrome.storage.local.set({ [key]: value });
  },
  async remove(key: string): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage) return;
    await chrome.storage.local.remove(key);
  },
};

import type { StorageAdapter } from "./adapter";

/**
 * `chrome.storage.local`-backed adapter for the extension popup and
 * background service worker. Falls through to a no-op when running outside
 * the extension runtime. External changes are surfaced via
 * `chrome.storage.onChanged`, which lets the popup react to writes the BG
 * makes (and vice versa).
 */

interface ChromeStorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

declare const chrome:
  | {
      storage?: {
        local: {
          get(key: string): Promise<Record<string, unknown>>;
          set(items: Record<string, unknown>): Promise<void>;
          remove(key: string): Promise<void>;
        };
        onChanged: {
          addListener(
            cb: (
              changes: Record<string, ChromeStorageChange>,
              areaName: string,
            ) => void,
          ): void;
          removeListener(
            cb: (
              changes: Record<string, ChromeStorageChange>,
              areaName: string,
            ) => void,
          ): void;
        };
      };
    }
  | undefined;

const hasChrome = () => typeof chrome !== "undefined" && !!chrome.storage;

export const chromeStorageAdapter: StorageAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    if (!hasChrome()) return undefined;
    const result = await chrome!.storage!.local.get(key);
    return result[key] as T | undefined;
  },
  async set<T>(key: string, value: T): Promise<void> {
    if (!hasChrome()) return;
    await chrome!.storage!.local.set({ [key]: value });
  },
  async remove(key: string): Promise<void> {
    if (!hasChrome()) return;
    await chrome!.storage!.local.remove(key);
  },
  subscribe<T>(key: string, listener: (value: T | undefined) => void) {
    if (!hasChrome()) return () => {};
    const handler = (
      changes: Record<string, ChromeStorageChange>,
      area: string,
    ) => {
      if (area !== "local") return;
      const change = changes[key];
      if (!change) return;
      listener(change.newValue as T | undefined);
    };
    chrome!.storage!.onChanged.addListener(handler);
    return () => chrome!.storage!.onChanged.removeListener(handler);
  },
};

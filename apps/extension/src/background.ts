/**
 * Pomotimer background service worker (MV3).
 *
 * Owns timer completion authoritatively so the timer continues to advance
 * while the popup is closed:
 *
 *  1. Storage is the single source of truth (`pomotimer:v1`).
 *  2. The popup writes `endsAt` (and pause/reset/skip mutations) directly.
 *  3. We watch `chrome.storage.onChanged` and mirror `endsAt` into a
 *     `chrome.alarms` entry that fires once at the deadline.
 *  4. When the alarm fires, we run `applyCompletion` (pure) and write the
 *     resulting state back. The popup picks it up via the same storage
 *     subscription on next open (or live, if open).
 */

import { applyCompletion, type AppPersistedState } from "@pomotimer/core";

const STORAGE_KEY = "pomotimer:v1";
const ALARM_NAME = "pomotimer:completion";

async function readState(): Promise<AppPersistedState | undefined> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] as AppPersistedState | undefined;
}

async function writeState(state: AppPersistedState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

async function syncAlarm(state: AppPersistedState | undefined): Promise<void> {
  await chrome.alarms.clear(ALARM_NAME);
  if (!state || state.endsAt == null) return;

  // chrome.alarms.create accepts an absolute `when` ms; if it's in the past,
  // the alarm fires almost immediately, which is what we want.
  await chrome.alarms.create(ALARM_NAME, { when: state.endsAt });
}

async function handleCompletion(): Promise<void> {
  const state = await readState();
  if (!state || state.endsAt == null) return;
  // Defensive: if for any reason the alarm fired early, requeue.
  if (state.endsAt > Date.now() + 250) {
    await chrome.alarms.create(ALARM_NAME, { when: state.endsAt });
    return;
  }
  const next = applyCompletion(state);
  await writeState(next);
  // Optional: surface a desktop notification so the user notices when the
  // popup is closed. Wrapped in try/catch since the permission is optional.
  try {
    const completedMode = state.mode;
    const title =
      completedMode === "pomodoro" ? "Focus session complete" : "Break complete";
    const message =
      completedMode === "pomodoro"
        ? "Take a break — the next round is queued."
        : "Time to focus again.";
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icons/icon-128.png",
      title,
      message,
    });
  } catch {
    // notifications permission not granted — ignore.
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  const change = changes[STORAGE_KEY];
  if (!change) return;
  const next = change.newValue as AppPersistedState | undefined;
  void syncAlarm(next);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  void handleCompletion();
});

// On install / update / SW spin-up, reconcile the alarm with current state.
chrome.runtime.onInstalled.addListener(() => {
  void readState().then(syncAlarm);
});
chrome.runtime.onStartup.addListener(() => {
  void readState().then(syncAlarm);
});
// Run once on cold start of this SW.
void readState().then(syncAlarm);

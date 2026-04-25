import { computeSecondsLeft, formatMmSs } from "@pomotimer/core";
import { useEffect, useState } from "react";

import { useStores, useTimerState } from "./StoresContext";
import { activeTask } from "./tasksStore";
import { isRunning } from "./timerStore";

/**
 * Returns live seconds-left, derived from `endsAt + Date.now()`. Re-renders
 * every 250ms while the timer is running so the displayed value stays
 * fresh; idle while paused.
 */
export function useSecondsLeft(): number {
  const endsAt = useTimerState((s) => s.endsAt);
  const pausedSecondsLeft = useTimerState((s) => s.pausedSecondsLeft);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt == null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);

  return computeSecondsLeft(endsAt, pausedSecondsLeft, now);
}

/** Convenience: `true` when there's an active deadline. */
export function useIsRunning(): boolean {
  return useTimerState(isRunning);
}

export interface TimerEngineOptions {
  /** Mirror remaining time into `document.title`. Default `true`. */
  syncDocumentTitle?: boolean;
  /** Title suffix when running. */
  titleSuffix?: string;
  /**
   * If `true` (default), this surface owns completion: when the deadline
   * passes, log a session, bump the active task's pomos, and advance the
   * mode. Set `false` for the extension popup (the BG service worker
   * handles completion authoritatively).
   */
  handleCompletion?: boolean;
  /** Optional callback fired after completion has been applied. */
  onComplete?: (mode: "pomodoro" | "short" | "long") => void;
}

/**
 * Drive completion + document.title for an open surface. Mount once, near
 * the root, inside <StoresProvider>.
 */
export function useTimerEngine(options: TimerEngineOptions = {}) {
  const {
    syncDocumentTitle = true,
    titleSuffix = "Pomotimer",
    handleCompletion = true,
    onComplete,
  } = options;
  const { timer, tasks, stats } = useStores();

  // Completion: schedule a single setTimeout for endsAt (web). Re-set
  // whenever endsAt changes. Skipped when handleCompletion is false.
  useEffect(() => {
    if (!handleCompletion) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      const { endsAt } = timer.store.state;
      if (endsAt == null) return;
      const delay = Math.max(0, endsAt - Date.now());
      timeoutId = setTimeout(() => {
        const completedMode = timer.store.state.mode;
        timer.advanceAfterCompletion({
          onFocusComplete: (sessionSeconds) => {
            const active = activeTask(tasks.store.state);
            stats.logSession(sessionSeconds, active?.id);
            if (active) tasks.incrementPomos(active.id);
          },
        });
        onComplete?.(completedMode);
      }, delay);
    };

    schedule();
    const unsubscribe = timer.store.subscribe(schedule);
    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timer, tasks, stats, handleCompletion, onComplete]);

  // <title> sync.
  useEffect(() => {
    if (!syncDocumentTitle || typeof document === "undefined") return;
    const original = document.title;
    const paint = () => {
      const { endsAt, pausedSecondsLeft } = timer.store.state;
      document.title = `${formatMmSs(
        computeSecondsLeft(endsAt, pausedSecondsLeft),
      )} — ${titleSuffix}`;
    };
    paint();
    // Repaint roughly every second while running.
    const id = setInterval(() => {
      if (timer.store.state.endsAt != null) paint();
    }, 500);
    const unsubscribe = timer.store.subscribe(paint);
    return () => {
      clearInterval(id);
      unsubscribe();
      document.title = original;
    };
  }, [timer, syncDocumentTitle, titleSuffix]);
}

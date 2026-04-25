import { formatMmSs } from "@pomotimer/core";
import { useEffect } from "react";

import { useStores } from "./StoresContext";
import { activeTask } from "./tasksStore";

export interface TimerEngineOptions {
  /** Mirror remaining time into `document.title`. Defaults to `true`. */
  syncDocumentTitle?: boolean;
  /** Title suffix when running. */
  titleSuffix?: string;
  /** Called when a session completes (after stats logged + advance). */
  onComplete?: (mode: "pomodoro" | "short" | "long") => void;
}

/**
 * Drives the timer:
 *  - 1Hz tick while `running` is true.
 *  - On completion: log a session (focus only), bump the active task's pomos,
 *    advance the mode, fire `onComplete`.
 *  - Mirrors `mm:ss — Pomotimer` into `document.title`.
 *
 * Mount once, near the root, inside <StoresProvider>.
 */
export function useTimerEngine(options: TimerEngineOptions = {}) {
  const {
    syncDocumentTitle = true,
    titleSuffix = "Pomotimer",
    onComplete,
  } = options;
  const { timer, tasks, stats } = useStores();

  // Tick.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const unsubscribe = timer.store.subscribe(() => {
      const running = timer.store.state.running;
      if (running && interval == null) {
        interval = setInterval(() => {
          const completed = timer.tick();
          if (!completed) return;

          const state = timer.store.state;
          // We just transitioned secondsLeft -> 0 in `state` for the
          // current mode; capture mode + duration before advancing.
          const completedMode = state.mode;
          if (completedMode === "pomodoro") {
            const sessionSeconds = state.durations.pomodoro;
            const active = activeTask(tasks.store.state);
            stats.logSession(sessionSeconds, active?.id);
            if (active) tasks.incrementPomos(active.id);
          }
          timer.advanceAfterCompletion();
          onComplete?.(completedMode);
        }, 1000);
      } else if (!running && interval != null) {
        clearInterval(interval);
        interval = null;
      }
    });

    // Kick once in case we mount with running already true.
    if (timer.store.state.running && interval == null) {
      interval = setInterval(() => {
        timer.tick();
      }, 1000);
    }

    return () => {
      unsubscribe();
      if (interval != null) clearInterval(interval);
    };
  }, [timer, tasks, stats, onComplete]);

  // <title> sync.
  useEffect(() => {
    if (!syncDocumentTitle || typeof document === "undefined") return;
    const original = document.title;
    const unsubscribe = timer.store.subscribe(() => {
      const { secondsLeft } = timer.store.state;
      document.title = `${formatMmSs(secondsLeft)} — ${titleSuffix}`;
    });
    // Initial paint
    document.title = `${formatMmSs(timer.store.state.secondsLeft)} — ${titleSuffix}`;
    return () => {
      unsubscribe();
      document.title = original;
    };
  }, [timer, syncDocumentTitle, titleSuffix]);
}

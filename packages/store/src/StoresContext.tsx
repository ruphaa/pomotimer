import { useStore } from "@tanstack/react-store";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StorageAdapter } from "@pomotimer/core";

import {
  createPomotimerStores,
  type PomotimerStores,
} from "./createPomotimerStores";
import type { TasksState } from "./tasksStore";
import type { TimerState } from "./timerStore";
import type { StatsState } from "./statsStore";

const StoresContext = createContext<PomotimerStores | null>(null);

export interface StoresProviderProps {
  storage: StorageAdapter;
  children: ReactNode;
  /** Optional callback fired once hydration completes. */
  onHydrated?: () => void;
}

export function StoresProvider({
  storage,
  children,
  onHydrated,
}: StoresProviderProps) {
  const stores = useMemo(() => createPomotimerStores(storage), [storage]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    stores.hydrated.then(() => {
      if (!alive) return;
      setHydrated(true);
      onHydrated?.();
    });
    return () => {
      alive = false;
      stores.dispose();
    };
  }, [stores, onHydrated]);

  // Render children regardless — components see initial state until hydrated.
  // Mark on the root so components can fade in if they want to.
  return (
    <StoresContext.Provider value={stores}>
      <div data-hydrated={hydrated || undefined} style={{ display: "contents" }}>
        {children}
      </div>
    </StoresContext.Provider>
  );
}

export function useStores(): PomotimerStores {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores must be used inside <StoresProvider>");
  }
  return ctx;
}

export function useTimerState<T = TimerState>(
  selector: (s: TimerState) => T = (s) => s as unknown as T,
): T {
  const { timer } = useStores();
  return useStore(timer.store, selector);
}

export function useTasksState<T = TasksState>(
  selector: (s: TasksState) => T = (s) => s as unknown as T,
): T {
  const { tasks } = useStores();
  return useStore(tasks.store, selector);
}

export function useStatsState<T = StatsState>(
  selector: (s: StatsState) => T = (s) => s as unknown as T,
): T {
  const { stats } = useStores();
  return useStore(stats.store, selector);
}

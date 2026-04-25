import { localStorageAdapter } from "@pomotimer/core/storage/local";
import {
  StoresProvider,
  useStores,
  useTasksState,
  useTimerEngine,
  useTimerState,
} from "@pomotimer/store";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Footer } from "../features/layout/Footer";
import { Header } from "../features/layout/Header";
import { StatsStrip } from "../features/stats/StatsStrip";
import { WeeklyBarChart } from "../features/stats/WeeklyBarChart";
import { Controls } from "../features/timer/Controls";
import { ModeTabs } from "../features/timer/ModeTabs";
import { ProgressBar } from "../features/timer/ProgressBar";
import { TimerNumerals } from "../features/timer/TimerNumerals";
import { NowFocusingCallout } from "../features/tasks/NowFocusingCallout";
import { TaskPanel } from "../features/tasks/TaskPanel";

export const Route = createFileRoute("/app")({
  component: AppRoute,
  ssr: false,
});

function AppRoute() {
  return (
    <StoresProvider storage={localStorageAdapter}>
      <AppShell />
    </StoresProvider>
  );
}

function AppShell() {
  useTimerEngine();
  useSpaceHotkey();
  useModeAttribute();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto" }}>
        <Header />
      </div>
      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          columnGap: 56,
        }}
      >
        <LeftColumn />
        <RightColumn />
      </main>
      <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto" }}>
        <Footer />
      </div>
    </div>
  );
}

function LeftColumn() {
  const round = useTimerState((s) => s.round);
  const activeTaskText = useActiveTaskText();

  return (
    <section style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 48 }}>
        <ModeTabs />
      </div>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          margin: "0 0 12px",
        }}
      >
        Round {round}
        {activeTaskText ? ` · ${activeTaskText}` : ""}
      </p>

      <TimerNumerals />
      <ProgressBar />
      <Controls />
      <StatsStrip />
      <WeeklyBarChart />
    </section>
  );
}

function RightColumn() {
  return (
    <section style={{ paddingTop: 32 }}>
      <TaskPanel />
      <NowFocusingCallout />
    </section>
  );
}

function useActiveTaskText(): string | undefined {
  return useTasksState(
    (s) => s.tasks.find((t) => t.active && !t.done)?.text,
  );
}

function useSpaceHotkey() {
  const { timer } = useStores();
  const editing = useTimerState((s) => s.editingTimer);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea/i.test(target.tagName)) return;
      if (editing) return;
      e.preventDefault();
      timer.toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [timer, editing]);
}

function useModeAttribute() {
  const mode = useTimerState((s) => s.mode);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.mode = mode;
  }, [mode]);
}

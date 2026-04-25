import { createFileRoute } from "@tanstack/react-router";
import { localStorageAdapter } from "@pomotimer/core/storage/local";
import {
  StoresProvider,
  useStores,
  useTimerEngine,
  useTimerState,
} from "@pomotimer/store";
import { formatMmSs } from "@pomotimer/core";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  component: AppRoute,
  // Timer is purely client state; no value in SSR-rendering it.
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

  const secondsLeft = useTimerState((s) => s.secondsLeft);
  const running = useTimerState((s) => s.running);
  const mode = useTimerState((s) => s.mode);
  const round = useTimerState((s) => s.round);
  const { timer } = useStores();

  // The colon pulses every other second while running.
  const colonDim = running && secondsLeft % 2 === 1;
  const [mm, ss] = formatMmSs(secondsLeft).split(":");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            margin: 0,
          }}
        >
          Round {round} · {modeLabel(mode)}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 300,
            fontSize: "168px",
            lineHeight: 1,
            letterSpacing: "-0.06em",
            margin: "16px 0 0",
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {mm}
          <span
            style={{
              opacity: colonDim ? 0.25 : 1,
              transition: "opacity 0.4s ease",
            }}
          >
            :
          </span>
          {ss}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 32,
          }}
        >
          <button
            onClick={timer.toggle}
            style={{
              padding: "14px 44px",
              borderRadius: "var(--radius-pill)",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "var(--shadow-button-primary)",
              transition: "var(--transition-accent)",
            }}
          >
            {running ? "Pause" : "Start focus"}
          </button>
          <button
            onClick={timer.reset}
            style={pillButtonStyle()}
            aria-label="Reset"
          >
            ↺
          </button>
          <button
            onClick={timer.skip}
            style={pillButtonStyle()}
            aria-label="Skip"
          >
            ⇥
          </button>
        </div>
        <p
          style={{
            marginTop: 24,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-tertiary)",
          }}
        >
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 6px",
              borderRadius: "var(--radius-xs)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-soft)",
              marginRight: 8,
            }}
          >
            Space
          </kbd>
          to start/pause
        </p>
        <ModeSwitcher />
      </div>
    </main>
  );
}

function ModeSwitcher() {
  const mode = useTimerState((s) => s.mode);
  const { timer } = useStores();
  const modes: Array<{ id: "pomodoro" | "short" | "long"; label: string }> = [
    { id: "pomodoro", label: "Focus 25m" },
    { id: "short", label: "Short 5m" },
    { id: "long", label: "Long 15m" },
  ];
  return (
    <div
      style={{
        marginTop: 32,
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-subtle)",
      }}
    >
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => timer.setMode(m.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              background: active ? "var(--bg-surface)" : "transparent",
              boxShadow: active ? "var(--shadow-card)" : "none",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              transition: "var(--transition-accent)",
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function pillButtonStyle(): React.CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "var(--bg-subtle)",
    color: "var(--text-secondary)",
    display: "inline-grid",
    placeItems: "center",
    fontSize: 16,
  };
}

function modeLabel(mode: "pomodoro" | "short" | "long") {
  return mode === "pomodoro"
    ? "Focus"
    : mode === "short"
      ? "Short break"
      : "Long break";
}

/** Toggle running on Space; ignore when typing in a field. */
function useSpaceHotkey() {
  const { timer } = useStores();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea/i.test(target.tagName)) return;
      e.preventDefault();
      timer.toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [timer]);
}

/** Reflect the current mode onto <html> so CSS vars switch. */
function useModeAttribute() {
  const mode = useTimerState((s) => s.mode);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.mode = mode;
  }, [mode]);
}

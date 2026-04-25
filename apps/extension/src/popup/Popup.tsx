import { chromeStorageAdapter } from "@pomotimer/core/storage/chrome";
import { localStorageAdapter } from "@pomotimer/core/storage/local";
import { formatMmSs, type Mode } from "@pomotimer/core";
import {
  StoresProvider,
  useStores,
  useTimerEngine,
  useTimerState,
} from "@pomotimer/store";
import { useEffect } from "react";

// Use chrome.storage when available, fall back to localStorage when running
// the popup outside the extension runtime (e.g. `vite dev`).
const storage =
  typeof chrome !== "undefined" && chrome.storage
    ? chromeStorageAdapter
    : localStorageAdapter;

export function Popup() {
  return (
    <StoresProvider storage={storage}>
      <PopupShell />
    </StoresProvider>
  );
}

function PopupShell() {
  useTimerEngine({ syncDocumentTitle: false });
  useModeAttribute();

  const secondsLeft = useTimerState((s) => s.secondsLeft);
  const running = useTimerState((s) => s.running);
  const mode = useTimerState((s) => s.mode);
  const round = useTimerState((s) => s.round);
  const { timer } = useStores();

  const [mm, ss] = formatMmSs(secondsLeft).split(":");
  const colonDim = running && secondsLeft % 2 === 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--bg-mode)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        transition: "var(--transition-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ModeTabs />
      <div
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "0 18px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: 56,
              lineHeight: 1,
              letterSpacing: "-0.04em",
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
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            Round {round} · {modeLabel(mode)}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 10,
              justifyContent: "center",
            }}
          >
            <button
              onClick={timer.reset}
              style={miniRoundButton()}
              aria-label="Reset"
            >
              ↺
            </button>
            <button
              onClick={timer.toggle}
              style={{
                padding: "11px 32px",
                borderRadius: "var(--radius-pill)",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "var(--shadow-button-primary)",
                transition: "var(--transition-accent)",
              }}
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={timer.skip}
              style={miniRoundButton()}
              aria-label="Skip"
            >
              ⇥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeTabs() {
  const mode = useTimerState((s) => s.mode);
  const { timer } = useStores();
  const tabs: Array<{ id: Mode; label: string }> = [
    { id: "pomodoro", label: "Focus" },
    { id: "short", label: "Short" },
    { id: "long", label: "Long" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, padding: "14px 18px 0" }}>
      {tabs.map((t) => {
        const active = mode === t.id;
        return (
          <button
            key={t.id}
            onClick={() => timer.setMode(t.id)}
            style={{
              flex: 1,
              padding: "7px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              fontWeight: 500,
              background: active ? "rgba(42, 38, 34, 0.08)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              transition: "var(--transition-accent)",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function miniRoundButton(): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--bg-subtle)",
    color: "var(--text-secondary)",
    display: "inline-grid",
    placeItems: "center",
    fontSize: 14,
  };
}

function modeLabel(mode: Mode) {
  return mode === "pomodoro"
    ? "Focus"
    : mode === "short"
      ? "Short break"
      : "Long break";
}

function useModeAttribute() {
  const mode = useTimerState((s) => s.mode);
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);
}

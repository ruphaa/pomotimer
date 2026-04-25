import { chromeStorageAdapter } from "@pomotimer/core/storage/chrome";
import { localStorageAdapter } from "@pomotimer/core/storage/local";
import { type Mode } from "@pomotimer/core";
import {
  StoresProvider,
  useIsRunning,
  useStores,
  useTimerEngine,
  useTimerState,
} from "@pomotimer/store";
import {
  Info,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
  Download,
} from "lucide-react";
import { useEffect } from "react";

import { PopupTaskList } from "./PopupTaskList";
import { PopupTimerNumerals } from "./PopupTimerNumerals";
import { ProgressRing } from "./ProgressRing";

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
  // Background service worker handles completion authoritatively. The
  // popup just renders + drives UI updates.
  useTimerEngine({ syncDocumentTitle: false, handleCompletion: false });
  useModeAttribute();

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
      <PopupHeader />
      <ModeTabs />
      <TimerSection />
      <Controls />
      <PopupTaskList />
    </div>
  );
}

function PopupHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        borderBottom: "1px solid var(--border-hairline)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "var(--radius-sm)",
            background: "var(--accent)",
            color: "#fff",
            display: "inline-grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
            transition: "var(--transition-accent)",
          }}
        >
          P
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Pomotimer</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <SmallIconButton aria-label="About">
          <Info size={14} strokeWidth={1.75} />
        </SmallIconButton>
        <SmallIconButton aria-label="Sync">
          <Download size={14} strokeWidth={1.75} />
        </SmallIconButton>
        <SmallIconButton aria-label="Settings">
          <Settings size={14} strokeWidth={1.75} />
        </SmallIconButton>
      </div>
    </header>
  );
}

function SmallIconButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      style={{
        width: 26,
        height: 26,
        borderRadius: "var(--radius-sm)",
        color: "var(--text-secondary)",
        display: "inline-grid",
        placeItems: "center",
        transition: "background-color 0.15s ease",
      }}
    />
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

function TimerSection() {
  const round = useTimerState((s) => s.round);
  const mode = useTimerState((s) => s.mode);

  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        padding: "14px 18px 0",
      }}
    >
      <ProgressRing>
        <div>
          <PopupTimerNumerals />
          <div
            style={{
              marginTop: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            Round {round} · {mode === "pomodoro" ? "Focus" : "Break"}
          </div>
        </div>
      </ProgressRing>
    </div>
  );
}

function Controls() {
  const running = useIsRunning();
  const { timer } = useStores();

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        padding: "18px 18px 16px",
      }}
    >
      <RoundButton onClick={timer.reset} aria-label="Reset">
        <RotateCcw size={14} strokeWidth={1.75} />
      </RoundButton>
      <button
        onClick={timer.toggle}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
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
        {running ? (
          <Pause size={13} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={13} fill="currentColor" strokeWidth={0} />
        )}
        {running ? "Pause" : "Start"}
      </button>
      <RoundButton onClick={timer.skip} aria-label="Skip">
        <SkipForward size={14} strokeWidth={1.75} />
      </RoundButton>
    </div>
  );
}

function RoundButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--bg-subtle)",
        color: "var(--text-secondary)",
        display: "inline-grid",
        placeItems: "center",
        transition: "background-color 0.15s ease",
      }}
    />
  );
}

function useModeAttribute() {
  const mode = useTimerState((s) => s.mode);
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);
}

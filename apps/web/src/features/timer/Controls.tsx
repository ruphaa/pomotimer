import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

import { useIsRunning, useStores, useTimerState } from "@pomotimer/store";

import { IconButton } from "../../components/IconButton";
import { Kbd } from "../../components/Kbd";

export function Controls() {
  const running = useIsRunning();
  const mode = useTimerState((s) => s.mode);
  const { timer } = useStores();

  const primaryLabel = running
    ? "Pause"
    : mode === "pomodoro"
      ? "Start focus"
      : mode === "short"
        ? "Start short break"
        : "Start long break";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 32,
      }}
    >
      <button
        onClick={timer.toggle}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
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
        {running ? (
          <Pause size={16} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={16} fill="currentColor" strokeWidth={0} />
        )}
        <span>{primaryLabel}</span>
      </button>

      <IconButton onClick={timer.reset} aria-label="Reset">
        <RotateCcw size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton onClick={timer.skip} aria-label="Skip to next">
        <SkipForward size={18} strokeWidth={1.75} />
      </IconButton>

      <span style={{ flex: 1 }} />

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--text-tertiary)",
        }}
      >
        <Kbd>Space</Kbd>
        to start/pause
      </span>
    </div>
  );
}

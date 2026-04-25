import type { Mode } from "@pomotimer/core";
import { useStores, useTimerState } from "@pomotimer/store";

const tabs: Array<{ id: Mode; label: string }> = [
  { id: "pomodoro", label: "Focus" },
  { id: "short", label: "Short break" },
  { id: "long", label: "Long break" },
];

export function ModeTabs() {
  const mode = useTimerState((s) => s.mode);
  const durations = useTimerState((s) => s.durations);
  const { timer } = useStores();

  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 4,
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-subtle)",
      }}
    >
      {tabs.map((t) => {
        const active = mode === t.id;
        const minutes = Math.round(durations[t.id] / 60);
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => timer.setMode(t.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 7,
              background: active ? "var(--bg-surface)" : "transparent",
              boxShadow: active ? "var(--shadow-card)" : "none",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              transition: "var(--transition-accent)",
            }}
          >
            <span>{t.label}</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: active
                  ? "var(--text-tertiary)"
                  : "var(--text-tertiary)",
              }}
            >
              {minutes}m
            </span>
          </button>
        );
      })}
    </div>
  );
}

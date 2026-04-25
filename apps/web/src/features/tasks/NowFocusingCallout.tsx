import {
  activeTask,
  useSecondsLeft,
  useTasksState,
  useTimerState,
} from "@pomotimer/store";

export function NowFocusingCallout() {
  const task = useTasksState(activeTask);
  const secondsLeft = useSecondsLeft();
  const mode = useTimerState((s) => s.mode);

  if (!task || mode !== "pomodoro") return null;

  const minutesToGo = Math.max(1, Math.round(secondsLeft / 60));

  return (
    <aside
      style={{
        marginTop: 16,
        padding: "16px 18px",
        borderRadius: "var(--radius-xl)",
        background: "rgba(200, 85, 61, 0.05)",
        border: "1px solid rgba(200, 85, 61, 0.13)",
        transition: "var(--transition-accent)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent)",
          margin: 0,
          transition: "var(--transition-accent)",
        }}
      >
        Now focusing
      </p>
      <p
        style={{
          margin: "8px 0 4px",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {task.text}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-secondary)",
        }}
      >
        {task.pomos}/{task.est} · about {minutesToGo}m to go
      </p>
    </aside>
  );
}

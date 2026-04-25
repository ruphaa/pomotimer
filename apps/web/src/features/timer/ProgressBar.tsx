import { activeMinutes, useSecondsLeft, useTimerState } from "@pomotimer/store";

/** 480 × 2px track with accent fill that animates 1s linear. */
export function ProgressBar() {
  const secondsLeft = useSecondsLeft();
  const totalSeconds = useTimerState((s) => activeMinutes(s) * 60);
  const elapsed = Math.max(0, totalSeconds - secondsLeft);
  const pct =
    totalSeconds > 0 ? Math.min(100, (elapsed / totalSeconds) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: 480,
        maxWidth: "100%",
        height: 2,
        background: "rgba(42, 38, 34, 0.08)",
        borderRadius: 1,
        marginTop: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "var(--accent)",
          transition: "width 1s linear, background-color 0.4s ease",
        }}
      />
    </div>
  );
}

import { isoDate } from "@pomotimer/core";
import { last7Days, useStatsState } from "@pomotimer/store";

const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];

export function WeeklyBarChart() {
  const days = useStatsState((s) => last7Days(s));
  const todayKey = isoDate();

  // Cap visualization at the busiest day in the window, fall back to 4 pomos.
  const peakSeconds = Math.max(
    ...days.map((d) => d.seconds),
    4 * 25 * 60, // sensible floor so an empty week still draws stubs
  );

  return (
    <div style={{ marginTop: 40 }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          margin: "0 0 16px",
        }}
      >
        This week
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          alignItems: "end",
          gap: 12,
          height: 64,
        }}
      >
        {days.map((d) => {
          const isToday = d.date === todayKey;
          const dow = new Date(`${d.date}T12:00:00`).getDay();
          const heightPx =
            peakSeconds > 0
              ? Math.max(2, Math.round((d.seconds / peakSeconds) * 48))
              : 2;
          return (
            <div
              key={d.date}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 32,
                  height: heightPx,
                  borderRadius: 3,
                  background: isToday
                    ? "var(--accent)"
                    : "rgba(42, 38, 34, 0.1)",
                  transition: "var(--transition-accent)",
                }}
                title={`${d.pomodoros} pomodoros`}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: isToday
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                  fontWeight: isToday ? 600 : 500,
                }}
              >
                {dayLetters[dow]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

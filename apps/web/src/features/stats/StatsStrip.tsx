import { formatHoursMinutes } from "@pomotimer/core";
import {
  currentStreak,
  todayStats,
  useStatsState,
  useTasksState,
} from "@pomotimer/store";

interface Stat {
  label: string;
  value: string;
  sub: string;
}

export function StatsStrip() {
  const today = useStatsState(todayStats);
  const streak = useStatsState((s) => currentStreak(s));
  const tasksDoneToday = useTasksState(
    (s) => s.tasks.filter((t) => t.done).length,
  );

  const stats: Stat[] = [
    {
      label: "Pomodoros today",
      value: today.pomodoros.toString().padStart(2, "0"),
      sub:
        today.pomodoros === 0
          ? "Let’s start one"
          : `${today.pomodoros} session${today.pomodoros === 1 ? "" : "s"}`,
    },
    {
      label: "Focused time",
      value: formatHoursMinutes(today.seconds),
      sub: today.seconds > 0 ? "today" : "—",
    },
    {
      label: "Tasks done",
      value: tasksDoneToday.toString().padStart(2, "0"),
      sub: "checked off",
    },
    {
      label: "Streak",
      value: `${streak}d`,
      sub: streak === 0 ? "start a streak" : "consecutive days",
    },
  ];

  return (
    <div
      style={{
        marginTop: 80,
        paddingTop: 32,
        borderTop: "1px solid var(--border-hairline)",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 32,
      }}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <p style={overlineStyle}>{s.label}</p>
          <p style={valueStyle}>{s.value}</p>
          <p style={subStyle}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

const overlineStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--text-tertiary)",
  margin: 0,
};

const valueStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 28,
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: 1,
  color: "var(--text-primary)",
  margin: "12px 0 8px",
};

const subStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--text-secondary)",
  margin: 0,
};

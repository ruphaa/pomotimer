import {
  remainingCount,
  totalEstimatedRemaining,
  useTasksState,
} from "@pomotimer/store";
import { MoreHorizontal } from "lucide-react";

import { IconButton } from "../../components/IconButton";

import { AddTaskFooter } from "./AddTaskFooter";
import { TaskRow } from "./TaskRow";

export function TaskPanel() {
  const tasks = useTasksState((s) => s.tasks);
  const remaining = useTasksState(remainingCount);
  const estRemaining = useTasksState(totalEstimatedRemaining);

  return (
    <section
      style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--border-hairline)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            Today’s tasks
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            {remaining} remaining · est. {estRemaining} pomodoro
            {estRemaining === 1 ? "" : "s"}
          </p>
        </div>
        <IconButton size={28} aria-label="More actions">
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </IconButton>
      </header>

      <div
        style={{
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {tasks.length === 0 ? (
          <p
            style={{
              padding: "16px 12px",
              fontSize: 13,
              color: "var(--text-tertiary)",
              margin: 0,
            }}
          >
            No tasks yet. Add one below.
          </p>
        ) : (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>

      <AddTaskFooter />
    </section>
  );
}

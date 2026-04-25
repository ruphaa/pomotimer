import type { Task } from "@pomotimer/core";
import { useStores, useTasksState } from "@pomotimer/store";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

export function PopupTaskList() {
  const tasks = useTasksState((s) => s.tasks);
  const draft = useTasksState((s) => s.newTaskDraft);
  const { tasks: api } = useStores();
  const [adding, setAdding] = useState(false);

  return (
    <section
      style={{
        borderTop: "1px solid var(--border-hairline)",
        background: "rgba(42, 38, 34, 0.015)",
        padding: "12px 18px 14px",
        maxHeight: 200,
        overflowY: "auto",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}
        >
          Today’s tasks
        </span>
        <button
          onClick={() => setAdding((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--accent)",
            transition: "var(--transition-accent)",
          }}
        >
          <Plus size={11} strokeWidth={2.25} />
          Add
        </button>
      </header>

      {adding && (
        <input
          autoFocus
          value={draft}
          onChange={(e) => api.setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              api.commitDraft();
              setAdding(false);
            } else if (e.key === "Escape") {
              api.setDraft("");
              setAdding(false);
            }
          }}
          onBlur={() => {
            if (!draft.trim()) setAdding(false);
          }}
          placeholder="Add a task and hit Enter"
          style={{
            width: "100%",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 8px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-primary)",
            outline: "none",
            marginBottom: 6,
          }}
        />
      )}

      {tasks.length === 0 ? (
        <p
          style={{
            margin: "8px 0",
            fontSize: 12,
            color: "var(--text-tertiary)",
          }}
        >
          No tasks yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tasks.map((t) => (
            <PopupTaskRow key={t.id} task={t} />
          ))}
        </div>
      )}
    </section>
  );
}

function PopupTaskRow({ task }: { task: Task }) {
  const { tasks } = useStores();

  return (
    <div
      onClick={() => !task.done && tasks.setActive(task.id)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        background: task.active ? "var(--bg-surface)" : "transparent",
        boxShadow: task.active
          ? "inset 0 0 0 1px var(--border-hairline)"
          : "none",
        cursor: task.done ? "default" : "pointer",
        transition: "background-color 0.15s ease",
      }}
    >
      {task.active && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 6,
            bottom: 6,
            width: 2,
            borderRadius: 2,
            background: "var(--accent)",
            transition: "var(--transition-accent)",
          }}
        />
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          tasks.toggleDone(task.id);
        }}
        aria-label={task.done ? "Mark incomplete" : "Mark done"}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: task.done ? "none" : "1.5px solid var(--border-soft)",
          background: task.done ? "var(--accent)" : "transparent",
          color: "#fff",
          display: "inline-grid",
          placeItems: "center",
          transition: "var(--transition-accent)",
        }}
      >
        {task.done && <Check size={9} strokeWidth={3} />}
      </button>

      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-primary)",
          opacity: task.done ? 0.4 : 1,
          textDecoration: task.done ? "line-through" : "none",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {task.text}
      </span>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-secondary)",
        }}
      >
        {task.pomos}/{task.est}
      </span>
    </div>
  );
}

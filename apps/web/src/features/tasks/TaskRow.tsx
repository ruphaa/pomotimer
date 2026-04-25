import type { Task } from "@pomotimer/core";
import { useStores } from "@pomotimer/store";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

export function TaskRow({ task }: { task: Task }) {
  const { tasks } = useStores();
  const [hover, setHover] = useState(false);

  const baseBg = task.active
    ? "var(--bg-active-soft)"
    : hover
      ? "rgba(42, 38, 34, 0.03)"
      : "transparent";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !task.done && tasks.setActive(task.id)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        background: baseBg,
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

      <Checkbox
        checked={task.done}
        onClick={(e) => {
          e.stopPropagation();
          tasks.toggleDone(task.id);
        }}
      />

      <div style={{ minWidth: 0 }}>
        <div
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
        </div>
        {task.note && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.note}
          </div>
        )}
      </div>

      <PomodoroCounter task={task} />
    </div>
  );
}

function Checkbox({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={checked}
      aria-label={checked ? "Mark incomplete" : "Mark done"}
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: checked ? "none" : "1.5px solid var(--border-soft)",
        background: checked ? "var(--accent)" : "transparent",
        display: "inline-grid",
        placeItems: "center",
        color: "#fff",
        transition: "var(--transition-accent)",
      }}
    >
      {checked && <Check size={10} strokeWidth={3} />}
    </button>
  );
}

function PomodoroCounter({ task }: { task: Task }) {
  const { tasks } = useStores();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Stepper
        onClick={() => tasks.setEst(task.id, -1)}
        aria-label="Decrease estimate"
      >
        <Minus size={10} strokeWidth={2} />
      </Stepper>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-secondary)",
          minWidth: 28,
          textAlign: "center",
        }}
      >
        {task.pomos}/{task.est}
      </span>
      <Stepper
        onClick={() => tasks.setEst(task.id, 1)}
        aria-label="Increase estimate"
      >
        <Plus size={10} strokeWidth={2} />
      </Stepper>
    </div>
  );
}

function Stepper({
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      onClick={onClick}
      style={{
        width: 18,
        height: 18,
        borderRadius: "var(--radius-xs)",
        background: "rgba(42, 38, 34, 0.06)",
        color: "var(--text-secondary)",
        display: "inline-grid",
        placeItems: "center",
      }}
    >
      {children}
    </button>
  );
}

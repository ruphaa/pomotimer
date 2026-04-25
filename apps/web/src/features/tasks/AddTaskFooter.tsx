import { useStores, useTasksState } from "@pomotimer/store";
import { Plus } from "lucide-react";

import { Kbd } from "../../components/Kbd";

export function AddTaskFooter() {
  const draft = useTasksState((s) => s.newTaskDraft);
  const { tasks } = useStores();

  return (
    <div
      style={{
        borderTop: "1px solid var(--border-hairline)",
        padding: "12px 14px 16px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "1.5px dashed var(--border-soft)",
          display: "inline-grid",
          placeItems: "center",
          color: "var(--text-tertiary)",
        }}
      >
        <Plus size={9} strokeWidth={2} />
      </span>
      <input
        value={draft}
        onChange={(e) => tasks.setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            tasks.commitDraft();
          }
        }}
        placeholder="Add a task…"
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-primary)",
          width: "100%",
        }}
      />
      <span
        style={{
          opacity: draft.trim() ? 1 : 0.4,
          transition: "opacity 0.15s ease",
        }}
      >
        <Kbd>Enter</Kbd>
      </span>
    </div>
  );
}

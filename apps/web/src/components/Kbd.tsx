import type { ReactNode } from "react";

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        padding: "2px 6px",
        borderRadius: "var(--radius-xs)",
        background: "var(--bg-subtle)",
        border: "1px solid var(--border-soft)",
        color: "var(--text-secondary)",
        lineHeight: 1.4,
      }}
    >
      {children}
    </kbd>
  );
}

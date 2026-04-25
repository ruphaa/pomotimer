import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  /** Use the soft grey background by default; set false for a transparent variant. */
  filled?: boolean;
  children: ReactNode;
}

export function IconButton({
  size = 44,
  filled = true,
  style,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: filled ? "var(--bg-subtle)" : "transparent",
        color: "var(--text-secondary)",
        display: "inline-grid",
        placeItems: "center",
        transition: "background-color 0.15s ease, color 0.15s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

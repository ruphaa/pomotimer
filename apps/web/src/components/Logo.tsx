export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-sm)",
        background: "var(--accent)",
        color: "#fff",
        display: "inline-grid",
        placeItems: "center",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        transition: "var(--transition-accent)",
      }}
      aria-hidden
    >
      P
    </span>
  );
}

export function Wordmark() {
  return (
    <span
      style={{
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }}
    >
      Pomotimer
    </span>
  );
}

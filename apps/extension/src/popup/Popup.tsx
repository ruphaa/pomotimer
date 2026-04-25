export function Popup() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-mode)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        transition: "var(--transition-bg)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            fontSize: 56,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          25:00
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}
        >
          Pomotimer · popup scaffold
        </div>
      </div>
    </div>
  );
}

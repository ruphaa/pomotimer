export function Footer() {
  return (
    <footer
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        padding: "32px 32px 40px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--text-muted)",
      }}
    >
      <div>v2.4 · synced just now</div>
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "flex-end",
        }}
      >
        <span>⌘K Command palette</span>
        <span>? Shortcuts</span>
      </div>
    </footer>
  );
}

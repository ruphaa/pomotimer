export function Avatar({ initials = "AK" }: { initials?: string }) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#D4B896",
        color: "#fff",
        display: "inline-grid",
        placeItems: "center",
        fontSize: 11,
        fontWeight: 600,
      }}
      aria-label={`Signed in as ${initials}`}
    >
      {initials}
    </span>
  );
}

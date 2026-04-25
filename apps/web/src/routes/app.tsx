import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: AppRoute,
});

function AppRoute() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 300,
            fontSize: "168px",
            lineHeight: 1,
            letterSpacing: "-0.06em",
            margin: 0,
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          25:00
        </h1>
        <p
          style={{
            marginTop: 24,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}
        >
          Pomotimer · scaffold ready
        </p>
      </div>
    </main>
  );
}

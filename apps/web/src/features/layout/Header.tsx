import { Settings } from "lucide-react";

import { IconButton } from "../../components/IconButton";
import { Logo, Wordmark } from "../../components/Logo";

export function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo />
        <Wordmark />
      </div>
      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <IconButton size={32} aria-label="Settings">
          <Settings size={16} strokeWidth={1.75} />
        </IconButton>
      </nav>
    </header>
  );
}

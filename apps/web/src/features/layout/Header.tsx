import { Settings } from "lucide-react";

import { Avatar } from "../../components/Avatar";
import { IconButton } from "../../components/IconButton";
import { Logo, Wordmark } from "../../components/Logo";

const navItems = ["Today", "Reports", "Projects"];

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
        {navItems.map((item, i) => (
          <button
            key={item}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 500,
              color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)",
              background: i === 0 ? "var(--bg-subtle)" : "transparent",
              transition: "background-color 0.15s ease",
            }}
          >
            {item}
          </button>
        ))}
        <span
          aria-hidden
          style={{
            width: 1,
            height: 14,
            background: "var(--border-soft)",
            margin: "0 8px",
          }}
        />
        <IconButton size={32} aria-label="Settings">
          <Settings size={16} strokeWidth={1.75} />
        </IconButton>
        <Avatar />
      </nav>
    </header>
  );
}

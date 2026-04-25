import { activeMinutes, useStores, useTimerState } from "@pomotimer/store";
import { formatMmSs } from "@pomotimer/core";
import { useEffect, useRef, useState } from "react";

/**
 * 168px JetBrains Mono numerals. Click to enter edit mode (input replaces
 * the button, light terracotta tint). Blur or Enter to commit; clamp 1–180.
 * `:` separator pulses opacity 0.25 ↔ 1 every other second while running.
 */
export function TimerNumerals() {
  const secondsLeft = useTimerState((s) => s.secondsLeft);
  const running = useTimerState((s) => s.running);
  const editing = useTimerState((s) => s.editingTimer);
  const minutes = useTimerState(activeMinutes);
  const { timer } = useStores();

  if (editing) {
    return <TimerEditor initial={minutes} />;
  }

  const [mm, ss] = formatMmSs(secondsLeft).split(":");
  const colonDim = running && secondsLeft % 2 === 1;

  return (
    <button
      onClick={() => timer.setEditingTimer(true)}
      aria-label="Edit timer duration"
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 300,
        fontSize: 168,
        lineHeight: 1,
        letterSpacing: "-0.06em",
        color: "var(--text-primary)",
        fontVariantNumeric: "tabular-nums",
        background: "transparent",
        padding: "0 8px",
        borderRadius: "var(--radius-md)",
        cursor: "text",
      }}
    >
      {mm}
      <span
        style={{
          opacity: colonDim ? 0.25 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        :
      </span>
      {ss}
    </button>
  );
}

function TimerEditor({ initial }: { initial: number }) {
  const [value, setValue] = useState(String(initial));
  const inputRef = useRef<HTMLInputElement>(null);
  const { timer } = useStores();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => timer.commitEditedMinutes(value);
  const cancel = () => timer.setEditingTimer(false);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value.replace(/\D+/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        else if (e.key === "Escape") cancel();
      }}
      inputMode="numeric"
      maxLength={3}
      aria-label="Minutes"
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 300,
        fontSize: 168,
        lineHeight: 1,
        letterSpacing: "-0.06em",
        color: "var(--text-primary)",
        fontVariantNumeric: "tabular-nums",
        background: "var(--bg-active-soft)",
        border: "none",
        outline: "none",
        textAlign: "center",
        width: "5ch",
        padding: "0 8px",
        borderRadius: "var(--radius-md)",
      }}
    />
  );
}

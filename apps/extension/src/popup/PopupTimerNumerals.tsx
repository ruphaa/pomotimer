import { formatMmSs } from "@pomotimer/core";
import {
  activeMinutes,
  useIsRunning,
  useSecondsLeft,
  useStores,
  useTimerState,
} from "@pomotimer/store";
import { useEffect, useRef, useState } from "react";

/** 56px / 500 / mono. Click to enter edit mode. */
export function PopupTimerNumerals() {
  const secondsLeft = useSecondsLeft();
  const running = useIsRunning();
  const editing = useTimerState((s) => s.editingTimer);
  const minutes = useTimerState(activeMinutes);
  const { timer } = useStores();

  if (editing) return <Editor initial={minutes} />;

  const [mm, ss] = formatMmSs(secondsLeft).split(":");
  const colonDim = running && secondsLeft % 2 === 1;

  return (
    <button
      onClick={() => timer.setEditingTimer(true)}
      aria-label="Edit timer duration"
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        fontSize: 56,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color: "var(--text-primary)",
        fontVariantNumeric: "tabular-nums",
        background: "transparent",
        padding: "0 4px",
        borderRadius: "var(--radius-sm)",
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

function Editor({ initial }: { initial: number }) {
  const [value, setValue] = useState(String(initial));
  const ref = useRef<HTMLInputElement>(null);
  const { timer } = useStores();

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value.replace(/\D+/g, ""))}
      onBlur={() => timer.commitEditedMinutes(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") timer.commitEditedMinutes(value);
        else if (e.key === "Escape") timer.setEditingTimer(false);
      }}
      inputMode="numeric"
      maxLength={3}
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        fontSize: 56,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color: "var(--text-primary)",
        fontVariantNumeric: "tabular-nums",
        background: "var(--bg-active-soft)",
        border: "none",
        outline: "none",
        textAlign: "center",
        width: "5ch",
        padding: "0 4px",
        borderRadius: "var(--radius-sm)",
      }}
    />
  );
}

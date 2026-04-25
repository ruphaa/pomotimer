import { TIMER_LIMITS, type Mode } from "./types";

/**
 * Decide which mode follows the one that just completed.
 * - Focus → Short break (or Long break every Nth round).
 * - Either break → Focus.
 */
export function nextMode(current: Mode, completedFocusRounds: number): Mode {
  if (current === "pomodoro") {
    return completedFocusRounds % TIMER_LIMITS.longEvery === 0
      ? "long"
      : "short";
  }
  return "pomodoro";
}

/** Strip non-digits and clamp to [minMinutes, maxMinutes]. */
export function clampEditedMinutes(raw: string): number {
  const digits = raw.replace(/\D+/g, "");
  const n = parseInt(digits || "0", 10);
  if (Number.isNaN(n)) return TIMER_LIMITS.minMinutes;
  return Math.min(
    TIMER_LIMITS.maxMinutes,
    Math.max(TIMER_LIMITS.minMinutes, n),
  );
}

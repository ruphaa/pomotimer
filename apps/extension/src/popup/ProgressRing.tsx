import { activeMinutes, useSecondsLeft, useTimerState } from "@pomotimer/store";
import type { ReactNode } from "react";

const RADIUS = 100;
const STROKE = 6;
const SIZE = 220;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * 220px progress ring with track + accent fill. Renders children
 * (numerals + label) absolutely centered.
 */
export function ProgressRing({ children }: { children: ReactNode }) {
  const secondsLeft = useSecondsLeft();
  const totalSeconds = useTimerState((s) => activeMinutes(s) * 60);

  const remaining = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - remaining);

  return (
    <div
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(42, 38, 34, 0.06)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{
            transition:
              "stroke-dashoffset 1s linear, stroke 0.4s ease",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

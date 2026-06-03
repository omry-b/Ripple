"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its previous value to the next whenever it changes, so
 * metrics visibly *move* on poll refreshes, exposure edits, and stress changes
 * instead of snapping. Honors prefers-reduced-motion.
 */
export function useCountUp(target: number, durationMs = 600): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === target) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, durationMs]);

  return display;
}

type AnimatedValueProps = {
  value: number;
  format?: (n: number) => string;
  className?: string;
};

/** Renders a number that smoothly counts to `value` when it changes. */
export function AnimatedValue({ value, format, className }: AnimatedValueProps) {
  const animated = useCountUp(value);
  const text = format ? format(animated) : String(Math.round(animated));
  return <span className={className}>{text}</span>;
}

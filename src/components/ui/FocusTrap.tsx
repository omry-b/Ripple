"use client";

import { useEffect, useRef } from "react";

type FocusTrapProps = {
  active: boolean;
  onEscape?: () => void;
  children: React.ReactNode;
};

export function FocusTrap({ active, onEscape, children }: FocusTrapProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !rootRef.current) return;

    const root = rootRef.current;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, onEscape]);

  return <div ref={rootRef}>{children}</div>;
}


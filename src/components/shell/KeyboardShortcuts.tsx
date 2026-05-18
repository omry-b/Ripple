"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

const GOTO_ROUTES: Record<string, string> = {
  o: "/",
  s: "/signals",
  c: "/companies",
  w: "/scenario",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingGo, setPendingGo] = useState(false);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    let goTimer: ReturnType<typeof setTimeout> | undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setHelpOpen((o) => !o);
        return;
      }

      if (e.key === "Escape") {
        setHelpOpen(false);
        setPendingGo(false);
        return;
      }

      if (pendingGo) {
        const href = GOTO_ROUTES[e.key];
        if (href) {
          e.preventDefault();
          navigate(href);
        }
        setPendingGo(false);
        if (goTimer) clearTimeout(goTimer);
        return;
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPendingGo(true);
        goTimer = setTimeout(() => setPendingGo(false), 1200);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (goTimer) clearTimeout(goTimer);
    };
  }, [pendingGo, navigate]);

  if (!helpOpen) {
    return pendingGo ? (
      <div className="shortcut-toast" role="status" aria-live="polite">
        Go to… o overview · s signals · c companies · w scenario
      </div>
    ) : null;
  }

  return (
    <>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close shortcuts help"
        onClick={() => setHelpOpen(false)}
      />
      <div className="modal-panel shortcuts-panel" role="dialog" aria-label="Keyboard shortcuts">
        <div className="modal-header">
          <h2 className="modal-title">Keyboard shortcuts</h2>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setHelpOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <ul className="shortcuts-list">
          <li>
            <kbd>⌘</kbd> <kbd>K</kbd>
            <span>Command palette</span>
          </li>
          <li>
            <kbd>g</kbd> then <kbd>o</kbd>
            <span>Overview</span>
          </li>
          <li>
            <kbd>g</kbd> then <kbd>s</kbd>
            <span>Signals</span>
          </li>
          <li>
            <kbd>g</kbd> then <kbd>c</kbd>
            <span>Companies</span>
          </li>
          <li>
            <kbd>g</kbd> then <kbd>w</kbd>
            <span>Scenario workbench</span>
          </li>
          <li>
            <kbd>?</kbd>
            <span>This help</span>
          </li>
          <li>
            <kbd>Esc</kbd>
            <span>Close panels</span>
          </li>
        </ul>
        <p className="shortcuts-nav-hint">
          Pages: {NAV_ITEMS.map((n) => n.label).join(" · ")}
        </p>
      </div>
    </>
  );
}

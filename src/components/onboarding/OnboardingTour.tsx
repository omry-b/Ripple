"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ripple-onboarding-done";

export function OnboardingTour() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    const t = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <div className="onboarding-tour" role="dialog" aria-labelledby="onboarding-title">
      <h2 id="onboarding-title">Welcome to Ripple</h2>
      <ol>
        <li>
          Use <kbd>⌘K</kbd> to jump to companies, alerts, or signals.
        </li>
        <li>
          Press <kbd>?</kbd> for keyboard shortcuts (<kbd>g</kbd> then <kbd>o</kbd> = overview).
        </li>
        <li>Star companies on the ranking page to build a watchlist.</li>
      </ol>
      <div className="onboarding-actions">
        <Link href="/methodology" className="filter-export-btn" onClick={dismiss}>
          Read methodology
        </Link>
        <button type="button" className="filter-export-btn" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

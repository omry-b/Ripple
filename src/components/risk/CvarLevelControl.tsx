"use client";

import { useEffect, useState } from "react";
import type { CvarConfidence } from "@/lib/risk/cvar-config";
import { formatCvarLevel } from "@/lib/risk/cvar-config";

const STORAGE_KEY = "ripple-cvar-level";

export function CvarLevelControl() {
  const [level, setLevel] = useState<CvarConfidence>(95);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "99") setLevel(99);
    } catch {
      /* ignore */
    }
  }, []);

  const onChange = (next: CvarConfidence) => {
    setLevel(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new CustomEvent("ripple-cvar-level-change", { detail: next }));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="cvar-level-control" role="group" aria-label="CVaR confidence level">
      <span className="cvar-level-label">{formatCvarLevel(level)}</span>
      <button
        type="button"
        className={`cvar-level-btn${level === 95 ? " active" : ""}`}
        onClick={() => onChange(95)}
        aria-pressed={level === 95}
      >
        95%
      </button>
      <button
        type="button"
        className={`cvar-level-btn${level === 99 ? " active" : ""}`}
        onClick={() => onChange(99)}
        aria-pressed={level === 99}
      >
        99%
      </button>
    </div>
  );
}


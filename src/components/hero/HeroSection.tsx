"use client";

import type { DashboardSnapshot } from "@/types/domain";
import { useSnapshotCounters } from "@/lib/hooks";

type HeroSectionProps = {
  snapshot: DashboardSnapshot;
  showWordmark?: boolean;
};

export function HeroSection({ snapshot, showWordmark = true }: HeroSectionProps) {
  useSnapshotCounters(snapshot);

  return (
    <header className="hero-container">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="hero-inner">
        <span className="hero-eyebrow">GLOBAL SUPPLY CHAIN INTELLIGENCE</span>
        {showWordmark && <h1 className="gradient-wordmark">Ripple</h1>}
        <div className="hero-stats-row">
          <div className="hero-stat-box">
            <span className="hero-metric critical-accent" id="counter-index">
              0.0
            </span>
            <span className="hero-stat-label">Risk Index</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-box">
            <span className="hero-metric" id="counter-exposed">
              0
            </span>
            <span className="hero-stat-label">Exposed Cos</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-box">
            <span className="hero-metric critical-accent">
              $<span id="counter-cvar-hero">0.0</span>B
            </span>
            <span className="hero-stat-label">CVaR₉₅ Baseline</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-box">
            <span className="hero-metric" id="counter-signals">
              0
            </span>
            <span className="hero-stat-label">Live Signals</span>
          </div>
        </div>
      </div>
    </header>
  );
}

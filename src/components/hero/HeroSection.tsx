"use client";

import { useLiveData } from "@/context/LiveDataContext";
import { useSnapshotCounters } from "@/lib/hooks";
import { formatRelativeAsOf } from "@/lib/format";

type HeroSectionProps = {
  showWordmark?: boolean;
};

export function HeroSection({ showWordmark = true }: HeroSectionProps) {
  const { snapshot, asOf } = useLiveData();
  if (!snapshot) return null;

  useSnapshotCounters(snapshot);

  return (
    <header className="hero-container">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="hero-inner">
        <span className="hero-eyebrow">
          GLOBAL SUPPLY CHAIN INTELLIGENCE · Updated {formatRelativeAsOf(asOf)}
        </span>
        {showWordmark && <h1 className="gradient-wordmark">Ripple</h1>}
        <div className="hero-stats-row">
          <div className="hero-stat-box">
            <span className="hero-metric critical-accent" id="counter-index">
              {snapshot.riskIndex.toFixed(1)}
            </span>
            <span className="hero-stat-label">Risk Index</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-box">
            <span className="hero-metric" id="counter-exposed">
              {snapshot.exposedCompanies}
            </span>
            <span className="hero-stat-label">Exposed Cos</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-box">
            <span className="hero-metric critical-accent">
              $<span id="counter-cvar-hero">{snapshot.cvar95BaselineB.toFixed(1)}</span>B
            </span>
            <span className="hero-stat-label">CVaR₉₅ Baseline</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-box">
            <span className="hero-metric" id="counter-signals">
              {snapshot.liveSignalsCount}
            </span>
            <span className="hero-stat-label">Live Signals</span>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useLiveData } from "@/context/LiveDataContext";
import { useSnapshotCounters } from "@/lib/hooks";
import { formatRelativeAsOf } from "@/lib/format";

type HeroSectionProps = {
  showWordmark?: boolean;
};

const HERO_STATS = [
  { id: "counter-index", label: "Risk Index", accent: "critical-accent" as const, format: (v: number) => v.toFixed(1) },
  {
    id: "counter-exposed",
    label: "Exposed Cos",
    accent: "" as const,
    format: (v: number) => String(v),
  },
  {
    id: "counter-cvar-hero",
    label: "CVaR₉₅ Baseline",
    accent: "critical-accent" as const,
    format: (v: number) => `$${v.toFixed(1)}B`,
    prefix: "",
  },
  {
    id: "counter-signals",
    label: "Live Signals",
    accent: "" as const,
    format: (v: number) => String(v),
  },
] as const;

export function HeroSection({ showWordmark = true }: HeroSectionProps) {
  const { snapshot, asOf } = useLiveData();
  if (!snapshot) return null;

  useSnapshotCounters(snapshot);

  const values = [
    snapshot.riskIndex,
    snapshot.exposedCompanies,
    snapshot.cvar95BaselineB,
    snapshot.liveSignalsCount,
  ];

  return (
    <header className="hero-container hero-panel">
      <div className="hero-mesh" aria-hidden />
      <div className="hero-glow hero-glow-risk" aria-hidden />
      <div className="hero-glow hero-glow-trust" aria-hidden />
      <div className="hero-inner">
        <div className="hero-top-row">
          <span className="hero-eyebrow">
            GLOBAL SUPPLY CHAIN INTELLIGENCE · Updated {formatRelativeAsOf(asOf)}
          </span>
          {showWordmark && (
            <>
              <h1 className="hero-display">Ripple</h1>
              <p className="hero-tagline">
                Live exposure, signal streams, and scenario stress  -  quantified for your supply
                chain portfolio.
              </p>
            </>
          )}
        </div>
        <div className="hero-stats-grid" role="list" aria-label="Key risk metrics">
          {HERO_STATS.map((stat, i) => (
            <div key={stat.id} className="hero-stat-pill" role="listitem">
              <span
                className={`hero-metric tabular-nums ${stat.accent}`.trim()}
                id={stat.id}
              >
                {stat.format(values[i])}
              </span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

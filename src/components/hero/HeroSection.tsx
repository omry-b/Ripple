"use client";

import { useLiveData } from "@/context/LiveDataContext";
import { useSnapshotCounters } from "@/lib/hooks";
import { formatRelativeAsOf } from "@/lib/format";

type HeroSectionProps = {
  showWordmark?: boolean;
  /** Fewer stat pills on overview (metrics also appear in bento). */
  compact?: boolean;
};

const HERO_STATS_FULL = [
  { id: "counter-index", label: "Risk Index", accent: "critical-accent" as const, format: (v: number) => v.toFixed(1) },
  { id: "counter-exposed", label: "Exposed Cos", accent: "" as const, format: (v: number) => String(v) },
  { id: "counter-cvar-hero", label: "Portfolio CVaR", accent: "critical-accent" as const, format: (v: number) => `$${v.toFixed(1)}B` },
  { id: "counter-signals", label: "Live Signals", accent: "" as const, format: (v: number) => String(v) },
] as const;

const HERO_STATS_COMPACT = HERO_STATS_FULL.filter((s) =>
  ["counter-index", "counter-cvar-hero"].includes(s.id)
);

export function HeroSection({ showWordmark = true, compact = false }: HeroSectionProps) {
  const { snapshot, asOf } = useLiveData();
  if (!snapshot) return null;

  useSnapshotCounters(snapshot);

  const stats = compact ? HERO_STATS_COMPACT : HERO_STATS_FULL;
  const values: Record<string, number> = {
    "counter-index": snapshot.riskIndex,
    "counter-exposed": snapshot.exposedCompanies,
    "counter-cvar-hero": snapshot.portfolioCvarB,
    "counter-signals": snapshot.liveSignalsCount,
  };

  return (
    <header className={`hero-container hero-panel${compact ? " hero-panel--compact" : ""}`}>
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
                Live exposure, signal streams, and scenario stress quantified for your supply
                chain portfolio.
              </p>
            </>
          )}
        </div>
        <div
          className={`hero-stats-grid${compact ? " hero-stats-grid--compact" : ""}`}
          role="list"
          aria-label="Key risk metrics"
        >
          {stats.map((stat) => (
            <div key={stat.id} className="hero-stat-pill" role="listitem">
              <span
                className={`hero-metric tabular-nums ${stat.accent}`.trim()}
                id={stat.id}
              >
                {stat.format(values[stat.id])}
              </span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

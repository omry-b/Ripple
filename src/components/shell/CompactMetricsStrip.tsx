"use client";

import { useLiveData } from "@/context/LiveDataContext";
import { formatRelativeAsOf } from "@/lib/format";

export function CompactMetricsStrip() {
  const { snapshot, asOf } = useLiveData();
  if (!snapshot) return null;

  return (
    <div className="compact-metrics-strip" role="region" aria-label="Live risk summary">
      <span className="compact-metric">
        Index <strong className="critical-accent">{snapshot.riskIndex.toFixed(1)}</strong>
      </span>
      <span className="compact-metric-divider" />
      <span className="compact-metric">
        Exposed <strong>{snapshot.exposedCompanies}</strong>
      </span>
      <span className="compact-metric-divider" />
      <span className="compact-metric">
        CVaR <strong className="critical-accent">${snapshot.cvar95BaselineB.toFixed(1)}B</strong>
      </span>
      <span className="compact-metric-divider" />
      <span className="compact-metric">
        Signals <strong>{snapshot.liveSignalsCount}</strong>
      </span>
      <span className="compact-metric-updated">Updated {formatRelativeAsOf(asOf)}</span>
    </div>
  );
}

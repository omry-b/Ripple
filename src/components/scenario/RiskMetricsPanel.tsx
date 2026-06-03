import type { ScenarioRiskMetrics } from "@/types/domain";
import { formatCvarUsd } from "@/lib/risk/portfolio-metrics";

type RiskMetricsPanelProps = {
  metrics: ScenarioRiskMetrics;
};

/**
 * Coherent tail-risk readout from the Monte Carlo run: Expected Loss, VaR, CVaR
 * (Expected Shortfall) and the diversification benefit. CVaR ≥ VaR ≥ E[L] by
 * construction, and the diversification figure quantifies how much tail risk the
 * portfolio's structure removes versus holding each exposure standalone.
 */
export function RiskMetricsPanel({ metrics }: RiskMetricsPanelProps) {
  const confidencePct = Math.round(metrics.confidence * 100);
  const diversificationPct = Math.round((1 - metrics.diversificationRatio) * 100);

  return (
    <section className="workbench-card" aria-label="Monte Carlo tail-risk metrics">
      <h3 className="supplier-tier-title">
        Tail-risk metrics · {metrics.trials.toLocaleString()} Monte Carlo trials
      </h3>
      <div className="metric-tile-grid">
        <div className="metric-tile">
          <span className="metric-tile-label">Expected loss</span>
          <span className="metric-tile-value">{formatCvarUsd(metrics.expectedLossUsd)}</span>
          <span className="metric-tile-foot metric-tile-foot--muted">mean simulated loss</span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">VaR{confidencePct}</span>
          <span className="metric-tile-value elevated-accent">{formatCvarUsd(metrics.varUsd)}</span>
          <span className="metric-tile-foot metric-tile-foot--muted">
            {confidencePct}% quantile
          </span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">CVaR{confidencePct} (ES)</span>
          <span className="metric-tile-value critical-accent">{formatCvarUsd(metrics.cvarUsd)}</span>
          <span className="metric-tile-foot metric-tile-foot--muted">
            mean of worst {100 - confidencePct}% tail
          </span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">P99 loss</span>
          <span className="metric-tile-value">{formatCvarUsd(metrics.p99Usd)}</span>
          <span className="metric-tile-foot metric-tile-foot--muted">99th percentile</span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">Diversification</span>
          <span className="metric-tile-value">−{diversificationPct}%</span>
          <span className="metric-tile-foot metric-tile-foot--muted">
            {formatCvarUsd(metrics.diversificationBenefitUsd)} tail removed vs standalone
          </span>
        </div>
      </div>
    </section>
  );
}

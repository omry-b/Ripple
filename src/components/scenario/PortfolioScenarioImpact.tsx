"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLiveData } from "@/context/LiveDataContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { buildPositions, computePortfolioMetrics } from "@/lib/portfolio/metrics";
import { positionExpectedLossUsd } from "@/lib/risk/monte-carlo-engine";
import { formatCvarUsd } from "@/lib/risk/portfolio-metrics";

type PortfolioScenarioImpactProps = {
  scenarioName: string;
  /** Scenario severity as a percentage (100 = today's baseline). */
  severity: number;
};

/**
 * Answers the question the whole product is built around: "what does this
 * scenario do to *my* book?" Reuses the validated Monte Carlo engine to compare
 * the user's portfolio at today's baseline vs. the scenario's severity.
 */
export function PortfolioScenarioImpact({ scenarioName, severity }: PortfolioScenarioImpactProps) {
  const { dashboard } = useLiveData();
  const { ids, exposures, hasPortfolio } = usePortfolio();

  const positions = useMemo(() => {
    const companies = (dashboard?.companies ?? []).filter((c) => ids.has(c.id));
    return buildPositions(companies, exposures);
  }, [dashboard, ids, exposures]);

  const { baseline, stressed, worst } = useMemo(() => {
    const base = computePortfolioMetrics(positions, { severity: 100 });
    const str = computePortfolioMetrics(positions, { severity });
    const w = [...positions]
      .map((p) => ({
        company: p.company,
        loss: positionExpectedLossUsd(p.company.score, p.exposureUsd, severity / 100),
      }))
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 3);
    return { baseline: base, stressed: str, worst: w };
  }, [positions, severity]);

  if (!hasPortfolio) {
    return (
      <section className="workbench-card portfolio-scenario-impact" aria-label="Scenario impact on your portfolio">
        <h3 className="supplier-tier-title">Your portfolio under this scenario</h3>
        <p className="psi-empty">
          Add the suppliers you depend on to see exactly what <strong>{scenarioName}</strong> does
          to your book — stressed CVaR, expected loss, and your worst-hit positions.
        </p>
        <Link href="/companies" className="filter-export-btn portfolio-cta-primary psi-empty-cta">
          Build your portfolio →
        </Link>
      </section>
    );
  }

  const cvarDeltaUsd = stressed.cvarUsd - baseline.cvarUsd;
  const cvarDeltaPct =
    baseline.cvarUsd > 0 ? Math.round((cvarDeltaUsd / baseline.cvarUsd) * 100) : 0;
  const lossDeltaUsd = stressed.expectedLossUsd - baseline.expectedLossUsd;

  return (
    <section className="workbench-card portfolio-scenario-impact" aria-label="Scenario impact on your portfolio">
      <h3 className="supplier-tier-title">
        Your portfolio under {scenarioName} · {severity}% severity
      </h3>

      <p className="psi-takeaway">
        This scenario raises your tail loss (CVaR₉₅) by{" "}
        <strong className="critical-accent">
          {formatCvarUsd(cvarDeltaUsd)} ({cvarDeltaPct >= 0 ? "+" : ""}
          {cvarDeltaPct}%)
        </strong>{" "}
        and your expected loss by <strong>{formatCvarUsd(lossDeltaUsd)}</strong>.
      </p>

      <div className="psi-compare">
        <div className="psi-metric">
          <span className="metric-tile-label">CVaR₉₅ — today</span>
          <span className="metric-tile-value">{formatCvarUsd(baseline.cvarUsd)}</span>
        </div>
        <span className="psi-arrow" aria-hidden>
          →
        </span>
        <div className="psi-metric">
          <span className="metric-tile-label">CVaR₉₅ — scenario</span>
          <span className="metric-tile-value critical-accent">{formatCvarUsd(stressed.cvarUsd)}</span>
        </div>
        <div className="psi-metric">
          <span className="metric-tile-label">Expected loss</span>
          <span className="metric-tile-value">{formatCvarUsd(stressed.expectedLossUsd)}</span>
        </div>
      </div>

      <div className="psi-worst">
        <span className="metric-tile-label">Worst-hit positions</span>
        {worst.map((w) => (
          <Link key={w.company.id} href={`/companies/${w.company.id}`} className="psi-worst-row">
            <span className="psi-worst-name">{w.company.name}</span>
            <span className="psi-worst-loss critical-accent">{formatCvarUsd(w.loss)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

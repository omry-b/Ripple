"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLiveData } from "@/context/LiveDataContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { buildPositions, computePortfolioMetrics } from "@/lib/portfolio/metrics";
import { formatCvarUsd } from "@/lib/risk/portfolio-metrics";
import { riskLevelFromScore } from "@/lib/risk/levels";
import { AnimatedValue } from "@/components/portfolio/AnimatedValue";

const STARTER_PORTFOLIO = ["apple", "tsmc", "foxconn", "samsung", "nvidia"];

export function MyPortfolioPanel() {
  const { dashboard } = useLiveData();
  const { ids, exposures, hasPortfolio, stressSeverity, setStressSeverity } = usePortfolio();
  const { addMany } = useWatchlist();

  const companies = useMemo(
    () => (dashboard?.companies ?? []).filter((c) => ids.has(c.id)),
    [dashboard, ids]
  );

  const metrics = useMemo(
    () => computePortfolioMetrics(buildPositions(companies, exposures), { severity: stressSeverity }),
    [companies, exposures, stressSeverity]
  );

  if (!dashboard) return null;

  if (!hasPortfolio) {
    return (
      <section className="portfolio-empty workbench-card" aria-label="Build your portfolio">
        <div className="portfolio-empty-body">
          <h3 className="portfolio-empty-title">See your risk, not the world&apos;s</h3>
          <p className="portfolio-empty-lead">
            Add the suppliers and companies you actually depend on. Ripple will scope every
            metric — risk index, tail-loss (CVaR), and recommended actions — to <em>your</em> book.
          </p>
          <div className="portfolio-empty-actions">
            <button
              type="button"
              className="filter-export-btn portfolio-cta-primary"
              onClick={() => addMany(STARTER_PORTFOLIO)}
            >
              Start with a sample portfolio
            </button>
            <Link href="/companies" className="text-link">
              Browse companies to add →
            </Link>
          </div>
          <p className="portfolio-empty-hint">
            Tip: star any company on the rankings to add it. Set a dollar exposure to make the
            numbers yours.
          </p>
        </div>
      </section>
    );
  }

  const concentrationWarn = metrics.topConcentration >= 0.4;
  const myLevel = riskLevelFromScore(metrics.riskIndex);

  return (
    <section className="workbench-card my-portfolio-panel" aria-label="My portfolio risk">
      <div className="my-portfolio-head">
        <span className="card-title" style={{ marginBottom: 0 }}>
          My Portfolio · {metrics.positionCount} position{metrics.positionCount === 1 ? "" : "s"}
        </span>
        <Link href="/companies?watchlist=1" className="text-link">
          Manage →
        </Link>
      </div>

      <label className="portfolio-stress">
        <span className="portfolio-stress-label">
          Stress test
          <strong className={stressSeverity === 100 ? "" : "portfolio-stress-active"}>
            {stressSeverity === 100 ? " today" : ` ${stressSeverity}% severity`}
          </strong>
        </span>
        <input
          type="range"
          min={50}
          max={150}
          step={5}
          value={stressSeverity}
          onChange={(e) => setStressSeverity(Number(e.target.value))}
          aria-label="Portfolio stress severity"
        />
      </label>

      <div className="metric-tile-grid">
        <div className="metric-tile">
          <span className="metric-tile-label">My risk index</span>
          <AnimatedValue
            value={metrics.riskIndex}
            className={`metric-tile-value ${myLevel}-accent`}
          />
          <span className="metric-tile-foot metric-tile-foot--muted">
            exposure-weighted, 0–100
          </span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">My CVaR₉₅</span>
          <AnimatedValue
            value={metrics.cvarUsd}
            format={formatCvarUsd}
            className="metric-tile-value critical-accent"
          />
          <span className="metric-tile-foot metric-tile-foot--muted">tail loss, Monte Carlo</span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">Expected loss</span>
          <AnimatedValue
            value={metrics.expectedLossUsd}
            format={formatCvarUsd}
            className="metric-tile-value"
          />
          <span className="metric-tile-foot metric-tile-foot--muted">
            {stressSeverity === 100 ? "at current risk" : `at ${stressSeverity}% stress`}
          </span>
        </div>
        <div className="metric-tile">
          <span className="metric-tile-label">Total exposure</span>
          <AnimatedValue
            value={metrics.totalExposureUsd}
            format={formatCvarUsd}
            className="metric-tile-value"
          />
          <span className="metric-tile-foot metric-tile-foot--muted">
            {metrics.atRiskCount} at-risk · {metrics.criticalCount} critical
          </span>
        </div>
      </div>

      <div className="my-portfolio-mix">
        <div className="my-portfolio-mix-head">
          <span className="metric-tile-label">Exposure by region</span>
          {concentrationWarn && (
            <span className="status-pill status-pill-warn">
              {Math.round(metrics.topConcentration * 100)}% in one position
            </span>
          )}
        </div>
        <div className="region-mix-bar" role="img" aria-label="Exposure by region">
          {metrics.regionMix.map((r) => (
            <span
              key={r.region}
              className={`region-mix-seg region-${r.region.toLowerCase()}`}
              style={{ width: `${r.sharePct}%` }}
              title={`${r.region}: ${Math.round(r.sharePct)}%`}
            />
          ))}
        </div>
        <div className="region-mix-legend">
          {metrics.regionMix.map((r) => (
            <span key={r.region} className="region-mix-legend-item">
              <span className={`region-dot region-${r.region.toLowerCase()}`} />
              {r.region} {Math.round(r.sharePct)}%
            </span>
          ))}
        </div>
      </div>

      <div className="my-portfolio-top">
        <span className="metric-tile-label">Largest positions</span>
        {metrics.topPositions.map((p) => (
          <Link key={p.company.id} href={`/companies/${p.company.id}`} className="my-portfolio-pos-row">
            <span className="my-portfolio-pos-name">{p.company.name}</span>
            <span className="my-portfolio-pos-meta">
              <span className={`${riskLevelFromScore(p.company.score)}-accent`}>{p.company.score}</span>
              <span className="my-portfolio-pos-share">{formatCvarUsd(p.exposureUsd)} · {Math.round(p.sharePct)}%</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

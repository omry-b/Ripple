"use client";

import { useState } from "react";
import type { Company } from "@/types/domain";
import { usePortfolioOptional } from "@/context/PortfolioContext";
import { useWatchlistOptional } from "@/context/WatchlistContext";
import { recommendForCompany } from "@/lib/portfolio/recommendations";
import { defaultExposureUsd } from "@/lib/portfolio/metrics";
import { positionExpectedLossUsd } from "@/lib/risk/monte-carlo-engine";
import { formatCvarUsd } from "@/lib/risk/portfolio-metrics";

export function CompanyActionCard({ company }: { company: Company }) {
  const portfolio = usePortfolioOptional();
  const watchlist = useWatchlistOptional();
  const recommendation = recommendForCompany(company);

  const inPortfolio = portfolio?.ids.has(company.id) ?? false;
  const exposureUsd = portfolio?.exposures[company.id] ?? defaultExposureUsd(company);
  const dollarsAtRisk = positionExpectedLossUsd(company.score, exposureUsd);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => String(Math.round(exposureUsd / 1e6)));

  const commit = () => {
    const millions = Number(value);
    portfolio?.setExposure(
      company.id,
      Number.isFinite(millions) && millions > 0 ? millions * 1e6 : null
    );
    setEditing(false);
  };

  return (
    <section className="workbench-card company-action-card" aria-label="Your position and recommended action">
      <div className="company-action-grid">
        <div className="company-action-position">
          <span className="metric-tile-label">Your position</span>
          {inPortfolio ? (
            <>
              {editing ? (
                <span className="action-exposure-edit company-action-exposure">
                  $
                  <input
                    type="number"
                    min={0}
                    value={value}
                    autoFocus
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commit();
                      if (e.key === "Escape") setEditing(false);
                    }}
                    aria-label="Exposure in millions"
                  />
                  M
                </span>
              ) : (
                <button
                  type="button"
                  className="metric-display-medium company-action-exposure-btn"
                  onClick={() => setEditing(true)}
                >
                  {formatCvarUsd(exposureUsd)} ✎
                </button>
              )}
              <span className="metric-tile-foot metric-tile-foot--muted">
                {formatCvarUsd(dollarsAtRisk)} expected loss at current risk
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                className="filter-export-btn portfolio-cta-primary"
                onClick={() => watchlist?.toggle(company.id)}
                disabled={!watchlist}
              >
                + Add to my portfolio
              </button>
              <span className="metric-tile-foot metric-tile-foot--muted">
                Track your dollar exposure to this company
              </span>
            </>
          )}
        </div>

        <div className="company-action-reco action-reco">
          <span className="action-reco-title">→ {recommendation.title}</span>
          <p className="action-reco-rationale">{recommendation.rationale}</p>
          <div className="action-reco-tags">
            <span className="action-tag">Driver: {recommendation.factorLabel}</span>
            <span className="action-tag">Effort: {recommendation.effort}</span>
            <span className="action-tag">Cost: {recommendation.cost}</span>
            <span className="action-tag action-tag--impact">{recommendation.impact}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

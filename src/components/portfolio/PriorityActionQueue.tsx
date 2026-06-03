"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveData } from "@/context/LiveDataContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { buildPositions } from "@/lib/portfolio/metrics";
import { buildActionQueue, type PriorityAction } from "@/lib/portfolio/recommendations";
import { formatCvarUsd } from "@/lib/risk/portfolio-metrics";

function ExposureInput({ action }: { action: PriorityAction }) {
  const { setExposure } = usePortfolio();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => String(Math.round(action.exposureUsd / 1e6)));

  if (!editing) {
    return (
      <button
        type="button"
        className="action-exposure-btn"
        onClick={() => setEditing(true)}
        aria-label={`Set exposure for ${action.company.name}`}
      >
        {formatCvarUsd(action.exposureUsd)} exposure ✎
      </button>
    );
  }

  const commit = () => {
    const millions = Number(value);
    setExposure(action.company.id, Number.isFinite(millions) && millions > 0 ? millions * 1e6 : null);
    setEditing(false);
  };

  return (
    <span className="action-exposure-edit">
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
        aria-label={`Exposure in millions for ${action.company.name}`}
      />
      M
    </span>
  );
}

export function PriorityActionQueue() {
  const { dashboard } = useLiveData();
  const { ids, exposures, hasPortfolio } = usePortfolio();

  const actions = useMemo(() => {
    const companies = (dashboard?.companies ?? []).filter((c) => ids.has(c.id));
    const positions = buildPositions(companies, exposures);
    return buildActionQueue(positions, dashboard?.alerts ?? [], 5);
  }, [dashboard, ids, exposures]);

  if (!dashboard || !hasPortfolio || actions.length === 0) return null;

  return (
    <section className="workbench-card action-queue" aria-label="Priority actions">
      <div className="action-queue-head">
        <span className="card-title" style={{ marginBottom: 0 }}>
          What to do today
        </span>
        <span className="action-queue-sub">Ranked by dollars at risk on your positions</span>
      </div>

      <ol className="action-queue-list">
        {actions.map((a, i) => (
          <li key={a.company.id} className={`action-row action-row--${a.level}`}>
            <span className="action-rank">{i + 1}</span>
            <div className="action-main">
              <div className="action-row-head">
                <Link href={`/companies/${a.company.id}`} className="action-company">
                  {a.company.name}
                </Link>
                <span className={`action-level action-level--${a.level}`}>
                  {a.level.toUpperCase()}
                </span>
                {a.hasOpenAlert && <span className="action-alert-flag">● open alert</span>}
              </div>
              <div className="action-risk-line">
                <strong>{formatCvarUsd(a.dollarsAtRisk)}</strong> at risk
                <span className="action-dot">·</span>
                {a.reason}
                <span className="action-dot">·</span>
                <ExposureInput action={a} />
              </div>
              <div className="action-reco">
                <span className="action-reco-title">→ {a.recommendation.title}</span>
                <p className="action-reco-rationale">{a.recommendation.rationale}</p>
                <div className="action-reco-tags">
                  <span className="action-tag">Driver: {a.recommendation.factorLabel}</span>
                  <span className="action-tag">Effort: {a.recommendation.effort}</span>
                  <span className="action-tag">Cost: {a.recommendation.cost}</span>
                  <span className="action-tag action-tag--impact">{a.recommendation.impact}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

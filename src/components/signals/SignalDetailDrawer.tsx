"use client";

import Link from "next/link";
import type { Company, SignalStream } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import { SignalHistoryChart } from "@/components/charts/SignalHistoryChart";
import { MethodologyTooltip } from "./MethodologyTooltip";

type SignalDetailDrawerProps = {
  signal: SignalStream | null;
  companies: Company[];
  onClose: () => void;
};

export function SignalDetailDrawer({
  signal,
  companies,
  onClose,
}: SignalDetailDrawerProps) {
  if (!signal) return null;

  const related = companies.filter((c) => signal.relatedCompanyIds.includes(c.id));

  return (
    <>
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close signal detail"
        onClick={onClose}
      />
      <aside className="drawer-panel" role="dialog" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <div>
            <span
              className={`stream-badge ${
                signal.level === "critical"
                  ? "critical-bg"
                  : signal.level === "elevated"
                    ? "elevated-bg"
                    : "normal-bg"
              }`}
            >
              {signal.level.toUpperCase()}
            </span>
            <h2 id="drawer-title" className="drawer-title">
              {signal.name}
            </h2>
            <p className="drawer-category">{signal.category}</p>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="drawer-score-row">
          <span
            className="metric-display-medium"
            style={{ color: LEVEL_COLOR[signal.level] }}
          >
            {signal.score}
            <span style={{ fontSize: 14, color: "#404040" }}>/100</span>
          </span>
          <span className="stream-time">Updated {signal.time}</span>
        </div>

        <svg width="100%" height="48" viewBox="0 0 100 20" className="drawer-sparkline">
          <polyline
            points={signal.sparkline}
            fill="none"
            stroke={LEVEL_COLOR[signal.level]}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {signal.history7d?.length > 0 && (
          <SignalHistoryChart values={signal.history7d} level={signal.level} />
        )}

        <p className="drawer-description">{signal.description}</p>

        {signal.methodology && (
          <p className="drawer-methodology">
            <MethodologyTooltip methodology={signal.methodology} />
          </p>
        )}

        <span className="section-label" style={{ marginTop: 24 }}>
          Exposed companies
        </span>
        <ul className="drawer-company-list">
          {related.map((c) => (
            <li key={c.id}>
              <Link href={`/companies/${c.id}`} className="drawer-company-link">
                <span>{c.name}</span>
                <span className="score-badge critical-badge" style={{ fontSize: 10 }}>
                  {c.score}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import type { Company, DashboardSnapshot, Hotspot } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import { useCardSpotlight } from "@/lib/hooks";

const SPOTLIGHT_IDS = [
  "bento-map-card",
  "bento-cvar-card",
  "bento-signals-card",
  "bento-exposed-card",
  "bento-table-card",
];

type BentoGridProps = {
  snapshot: DashboardSnapshot;
  topCompanies: Pick<Company, "id" | "name" | "score" | "cvar" | "delta7d">[];
  hotspots: Hotspot[];
};

export function BentoGrid({ snapshot, topCompanies, hotspots }: BentoGridProps) {
  useCardSpotlight(SPOTLIGHT_IDS);

  return (
    <section className="bento-grid">
      <div className="bento-card bento-large" id="bento-map-card">
        <div>
          <div className="card-title">Global Risk Map</div>
          <svg
            className="map-container"
            viewBox="0 0 300 150"
            aria-label="Global risk map tracking supply chain disruptions"
          >
            <rect width="300" height="150" fill="#0D0D0D" />
            <line x1="0" y1="75" x2="300" y2="75" className="map-grid-line" />
            <line x1="150" y1="0" x2="150" y2="150" className="map-grid-line" />
            <g className="map-continent">
              <ellipse cx="60" cy="55" rx="35" ry="22" />
              <ellipse cx="85" cy="95" rx="20" ry="18" />
              <ellipse cx="165" cy="45" rx="30" ry="24" />
              <ellipse cx="235" cy="50" rx="28" ry="18" />
              <ellipse cx="180" cy="95" rx="16" ry="20" />
              <ellipse cx="255" cy="105" rx="14" ry="10" />
            </g>
            {hotspots.map((h, i) => (
              <g key={i}>
                <circle
                  cx={h.cx}
                  cy={h.cy}
                  r={h.level === "critical" ? 14 : 11}
                  fill={LEVEL_COLOR[h.level]}
                  opacity={0.06}
                  className="pulse-ring"
                />
                <circle
                  cx={h.cx}
                  cy={h.cy}
                  r={h.level === "critical" ? 6 : 5}
                  fill={LEVEL_COLOR[h.level]}
                  opacity={0.18}
                />
                <circle
                  cx={h.cx}
                  cy={h.cy}
                  r={h.level === "critical" ? 2.5 : 2}
                  fill={LEVEL_COLOR[h.level]}
                  opacity={h.level === "critical" ? 0.95 : 0.85}
                />
              </g>
            ))}
          </svg>
        </div>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#EF4444" }} />
            Critical ×1
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#F59E0B" }} />
            Elevated ×2
          </span>
        </div>
      </div>

      <div className="bento-card bento-wide" id="bento-cvar-card">
        <div className="card-title">CVaR₉₅ · 95th Percentile</div>
        <div className="metric-display-large critical-accent">
          {snapshot.cvar95Display}
        </div>
        <div className="card-subtitle">{snapshot.cvarDeltaLabel}</div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${snapshot.cvarProgressPercent}%` }}
          />
        </div>
      </div>

      <div className="bento-card bento-small" id="bento-signals-card">
        <div className="card-title">Live Signals</div>
        <div className="metric-display-medium" id="bento-val-signals">
          0
        </div>
        <div className="card-subtitle">{snapshot.signalsDeltaLabel}</div>
      </div>

      <div className="bento-card bento-small" id="bento-exposed-card">
        <div className="card-title">Exposed</div>
        <div className="metric-display-medium elevated-accent" id="bento-val-exposed">
          0
        </div>
        <div className="card-subtitle">of {snapshot.trackedCompanies} tracked</div>
      </div>

      <div className="bento-card bento-wide" id="bento-table-card">
        <div className="card-title">Top Risk Companies</div>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Company</th>
              <th className="num-col">Score</th>
              <th className="num-col">CVaR</th>
              <th className="num-col">Δ7d</th>
            </tr>
          </thead>
          <tbody>
            {topCompanies.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/companies/${row.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {row.name}
                  </Link>
                </td>
                <td
                  className="num-col"
                  style={{
                    color: row.score >= 70 ? "#EF4444" : "#F59E0B",
                    fontWeight: 600,
                  }}
                >
                  {row.score}
                </td>
                <td className="num-col">{row.cvar}</td>
                <td className="num-col" style={{ color: "#EF4444" }}>
                  {row.delta7d}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

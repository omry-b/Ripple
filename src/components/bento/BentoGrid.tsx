"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Company, DashboardSnapshot, Hotspot } from "@/types/domain";
import { GlobalRiskMap } from "@/components/bento/GlobalRiskMap";
import { MapFullscreenModal } from "@/components/bento/MapFullscreenModal";
import { MetricCard } from "@/components/bento/MetricCard";
import { WatchlistMetricCard } from "@/components/bento/WatchlistMetricCard";
import { CvarLevelControl } from "@/components/risk/CvarLevelControl";
import { useCardSpotlight } from "@/lib/hooks";

const SPOTLIGHT_IDS = [
  "bento-map-card",
  "bento-cvar-card",
  "bento-signals-card",
  "bento-exposed-card",
  "bento-watchlist-card",
  "bento-table-card",
];

type BentoGridProps = {
  snapshot: DashboardSnapshot;
  topCompanies: Pick<Company, "id" | "name" | "score" | "cvar" | "delta7d">[];
  hotspots: Hotspot[];
};

export function BentoGrid({ snapshot, topCompanies, hotspots }: BentoGridProps) {
  const router = useRouter();
  const [legend, setLegend] = useState({ critical: true, elevated: true });
  const [mapFullscreen, setMapFullscreen] = useState(false);
  useCardSpotlight(SPOTLIGHT_IDS);

  const visibleHotspots = useMemo(
    () =>
      hotspots.filter(
        (h) =>
          (h.level === "critical" && legend.critical) ||
          (h.level === "elevated" && legend.elevated)
      ),
    [hotspots, legend]
  );

  const onHotspotClick = (h: Hotspot) => {
    const alertParam = h.alertId.startsWith("signal-")
      ? ""
      : `alert=${encodeURIComponent(h.alertId)}`;
    const regionParam = `region=${encodeURIComponent(h.region)}`;
    const query = alertParam ? `${alertParam}&${regionParam}` : regionParam;
    router.push(`/companies?${query}`);
  };

  return (
    <section className="bento-grid">
      <div className="bento-card bento-large" id="bento-map-card">
        <div>
          <div className="map-card-header">
            <div className="card-title">Global Risk Map</div>
            <button
              type="button"
              className="filter-export-btn"
              onClick={() => setMapFullscreen(true)}
            >
              Full screen
            </button>
          </div>
          <GlobalRiskMap hotspots={visibleHotspots} onHotspotClick={onHotspotClick} />
        </div>
        <div className="map-legend map-legend-interactive">
          <button
            type="button"
            className={`legend-item legend-toggle${legend.critical ? " active" : ""}`}
            onClick={() => setLegend((l) => ({ ...l, critical: !l.critical }))}
            aria-pressed={legend.critical}
          >
            <span className="legend-dot" style={{ background: "#EF4444" }} />
            Critical
          </button>
          <button
            type="button"
            className={`legend-item legend-toggle${legend.elevated ? " active" : ""}`}
            onClick={() => setLegend((l) => ({ ...l, elevated: !l.elevated }))}
            aria-pressed={legend.elevated}
          >
            <span className="legend-dot" style={{ background: "#F59E0B" }} />
            Elevated
          </button>
        </div>
      </div>

      <div className="bento-card bento-wide" id="bento-cvar-card">
        <div className="map-card-header">
          <div className="card-title">Portfolio tail risk</div>
          <CvarLevelControl />
        </div>
        <div className="metric-display-large critical-accent">
          {snapshot.cvar95Display}
        </div>
        <div className="card-subtitle">{snapshot.cvarDeltaLabel}</div>
        <div className="progress-bar-bg cvar-progress-track">
          <div
            className="progress-bar-fill cvar-progress-fill"
            style={{ width: `${snapshot.cvarProgressPercent}%` }}
          />
        </div>
      </div>

      <MetricCard
        cardId="bento-signals-card"
        title="Live Signals"
        value={0}
        id="bento-val-signals"
        subtitle={snapshot.signalsDeltaLabel}
      />

      <MetricCard
        cardId="bento-exposed-card"
        title="Exposed"
        value={0}
        id="bento-val-exposed"
        subtitle={`of ${snapshot.trackedCompanies} tracked`}
        accent="elevated"
      />

      <WatchlistMetricCard />

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

      {mapFullscreen && (
        <MapFullscreenModal
          hotspots={hotspots}
          legend={legend}
          onHotspotClick={onHotspotClick}
          onClose={() => setMapFullscreen(false)}
        />
      )}
    </section>
  );
}

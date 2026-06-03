"use client";

import Link from "next/link";
import { useLiveData } from "@/context/LiveDataContext";
import { useWatchlist } from "@/context/WatchlistContext";

export function IntelligencePulse() {
  const { dashboard, snapshot } = useLiveData();
  const { ids: watchlistIds } = useWatchlist();

  if (!dashboard || !snapshot) return null;

  const critical = dashboard.companies.filter((c) => c.scoreLevel === "critical").length;
  const watchlistCritical = dashboard.companies.filter(
    (c) => watchlistIds.has(c.id) && c.scoreLevel === "critical"
  ).length;

  return (
    <div className="metric-tile-grid" aria-label="Portfolio pulse">
      <div className="metric-tile">
        <span className="metric-tile-label">Open alerts</span>
        <span className="metric-tile-value critical-accent">{snapshot.openAlertsCount}</span>
        <Link href="/alerts" className="text-link metric-tile-foot">
          Inbox →
        </Link>
      </div>
      <div className="metric-tile">
        <span className="metric-tile-label">Critical exposure</span>
        <span className="metric-tile-value elevated-accent">{critical}</span>
        <span className="metric-tile-foot metric-tile-foot--muted">companies tracked</span>
      </div>
      <div className="metric-tile">
        <span className="metric-tile-label">Watchlist</span>
        <span className="metric-tile-value">{watchlistIds.size}</span>
        <span className="metric-tile-foot metric-tile-foot--muted">
          {watchlistCritical > 0 ? `${watchlistCritical} critical` : "starred names"}
        </span>
      </div>
      <div className="metric-tile">
        <span className="metric-tile-label">Active streams</span>
        <span className="metric-tile-value">{snapshot.activeStreamsCount}</span>
        <Link href="/signals" className="text-link metric-tile-foot">
          Signals →
        </Link>
      </div>
    </div>
  );
}

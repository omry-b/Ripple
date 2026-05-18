"use client";

import { LIVE_THRESHOLD_MS } from "@/lib/constants";

type LiveStatusProps = {
  asOf: string;
  isRefreshing?: boolean;
};

export function LiveStatus({ asOf, isRefreshing = false }: LiveStatusProps) {
  const age = Date.now() - new Date(asOf).getTime();
  const isLive = age < LIVE_THRESHOLD_MS;

  return (
    <div className="nav-status">
      <span
        className={`pulse-dot${isLive ? " live" : ""}`}
        style={isLive ? undefined : { background: "#404040", boxShadow: "none" }}
        role="status"
        aria-label={isLive ? "Data is live" : "Data is stale"}
      />
      <span className="status-text">
        {isRefreshing ? "Syncing" : isLive ? "Live" : "Stale"}
      </span>
    </div>
  );
}

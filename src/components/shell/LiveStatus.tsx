"use client";

import { LIVE_THRESHOLD_MS } from "@/types/domain";

type LiveStatusProps = {
  asOf: string;
};

export function LiveStatus({ asOf }: LiveStatusProps) {
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
      <span className="status-text">{isLive ? "Live" : "Stale"}</span>
    </div>
  );
}

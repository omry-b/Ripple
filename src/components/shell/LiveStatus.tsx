"use client";

import { useEffect, useState } from "react";
import { LIVE_THRESHOLD_MS } from "@/lib/constants";

type LiveStatusProps = {
  asOf: string;
  isRefreshing?: boolean;
};

export function LiveStatus({ asOf, isRefreshing = false }: LiveStatusProps) {
  // Compute liveness on the client (Date.now() is impure / would mismatch on
  // SSR hydration) and re-check periodically so the indicator stays accurate.
  const [isLive, setIsLive] = useState(true);
  useEffect(() => {
    const update = () => setIsLive(Date.now() - new Date(asOf).getTime() < LIVE_THRESHOLD_MS);
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [asOf]);

  return (
    <div className="nav-status">
      <span
        className={`pulse-dot${isLive ? " live" : " pulse-dot--stale"}`}
        role="status"
        aria-label={isLive ? "Data is live" : "Data is stale"}
      />
      <span className="status-text">
        {isRefreshing ? "Syncing" : isLive ? "Live" : "Stale"}
      </span>
    </div>
  );
}

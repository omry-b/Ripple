"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/bento/MetricCard";
import { getWatchlistIds } from "@/lib/watchlist";

export function WatchlistMetricCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getWatchlistIds().length);
    sync();
    window.addEventListener("ripple-watchlist-change", sync);
    return () => window.removeEventListener("ripple-watchlist-change", sync);
  }, []);

  return (
    <MetricCard
      cardId="bento-watchlist-card"
      title="My watchlist"
      value={count}
      subtitle={count === 0 ? "Star companies to track" : "Saved companies"}
      href="/companies?watchlist=1"
      id="bento-val-watchlist"
    />
  );
}

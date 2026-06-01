"use client";

import { MetricCard } from "@/components/bento/MetricCard";
import { useWatchlist } from "@/context/WatchlistContext";

export function WatchlistMetricCard() {
  const { ids, isSignedIn } = useWatchlist();
  const count = ids.size;

  return (
    <MetricCard
      cardId="bento-watchlist-card"
      title="My watchlist"
      value={count}
      subtitle={
        count === 0
          ? "Star companies to track"
          : isSignedIn
            ? "Synced to your account"
            : "Saved in this browser"
      }
      href="/companies?watchlist=1"
      id="bento-val-watchlist"
    />
  );
}

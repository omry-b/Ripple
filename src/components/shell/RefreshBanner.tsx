"use client";

import { useLiveData } from "@/context/LiveDataContext";

export function RefreshBanner() {
  const { lastError, refresh, isRefreshing } = useLiveData();

  if (!lastError) return null;

  return (
    <div className="refresh-error-banner">
      <span>Data sync failed: {lastError}</span>
      <button type="button" onClick={() => void refresh()} disabled={isRefreshing}>
        Retry
      </button>
    </div>
  );
}

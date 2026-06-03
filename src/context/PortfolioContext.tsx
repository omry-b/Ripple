"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWatchlistOptional } from "@/context/WatchlistContext";
import {
  getExposures,
  setExposure as persistExposure,
  type ExposureMap,
} from "@/lib/portfolio/storage";

type PortfolioContextValue = {
  /** Company ids held in the portfolio (mirrors the watchlist). */
  ids: Set<string>;
  /** Per-company dollar exposure overrides. */
  exposures: ExposureMap;
  /** Number of held positions. */
  count: number;
  /** True once the user holds at least one position. */
  hasPortfolio: boolean;
  setExposure: (companyId: string, exposureUsd: number | null) => void;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const watchlist = useWatchlistOptional();
  const watchlistIds = watchlist?.ids;
  const ids = useMemo(() => watchlistIds ?? new Set<string>(), [watchlistIds]);
  const [exposures, setExposuresState] = useState<ExposureMap>({});

  useEffect(() => {
    // Hydrate from localStorage on mount, then track cross-component changes.
    const sync = () => setExposuresState(getExposures());
    sync();
    window.addEventListener("ripple-portfolio-change", sync);
    return () => window.removeEventListener("ripple-portfolio-change", sync);
  }, []);

  const setExposure = useCallback((companyId: string, exposureUsd: number | null) => {
    const next = persistExposure(companyId, exposureUsd);
    setExposuresState({ ...next });
  }, []);

  const value = useMemo<PortfolioContextValue>(
    () => ({
      ids,
      exposures,
      count: ids.size,
      hasPortfolio: ids.size > 0,
      setExposure,
    }),
    [ids, exposures, setExposure]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}

export function usePortfolioOptional() {
  return useContext(PortfolioContext);
}

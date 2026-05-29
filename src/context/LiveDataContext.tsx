"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { DashboardPayload, DashboardSnapshot, TickerItem } from "@/types/domain";
import { DASHBOARD_POLL_MS } from "@/lib/constants";
import { fetchDashboard, fetchSnapshot } from "@/lib/client/api";

type LiveDataContextValue = {
  asOf: string;
  snapshot: DashboardSnapshot | null;
  dashboard: DashboardPayload | null;
  ticker: TickerItem[];
  isRefreshing: boolean;
  lastError: string | null;
  refresh: () => Promise<void>;
};

const LiveDataContext = createContext<LiveDataContextValue | null>(null);

type LiveDataProviderProps = {
  initialDashboard: DashboardPayload;
  children: React.ReactNode;
};

export function LiveDataProvider({ initialDashboard, children }: LiveDataProviderProps) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardPayload>(initialDashboard);
  const [asOf, setAsOf] = useState(initialDashboard.snapshot.asOf);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(initialDashboard.snapshot);
  const [ticker, setTicker] = useState<TickerItem[]>(initialDashboard.ticker);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const applyDashboard = useCallback((data: DashboardPayload) => {
    setDashboard(data);
    setAsOf(data.snapshot.asOf);
    setSnapshot(data.snapshot);
    setTicker(data.ticker);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchDashboard();
      applyDashboard(data);
      setLastError(null);
      router.refresh();
    } catch (dashboardError) {
      try {
        const { snapshot, asOf } = await fetchSnapshot();
        setSnapshot(snapshot);
        setAsOf(asOf);
        if (dashboard) {
          setDashboard({ ...dashboard, snapshot });
        }
        setLastError(null);
        router.refresh();
      } catch {
        setLastError(
          dashboardError instanceof Error ? dashboardError.message : "Refresh failed"
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [applyDashboard, dashboard, router]);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), DASHBOARD_POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  useEffect(() => {
    const onOrgChange = () => {
      void refresh();
    };
    window.addEventListener("ripple-demo-auth-change", onOrgChange);
    return () => window.removeEventListener("ripple-demo-auth-change", onOrgChange);
  }, [refresh]);

  const value = useMemo(
    () => ({ asOf, snapshot, dashboard, ticker, isRefreshing, lastError, refresh }),
    [asOf, snapshot, dashboard, ticker, isRefreshing, lastError, refresh]
  );

  return (
    <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
  );
}

export function useLiveData() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) {
    throw new Error("useLiveData must be used within LiveDataProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DashboardSnapshot } from "@/types/domain";
import { DASHBOARD_POLL_MS } from "@/lib/constants";
import { fetchSnapshot } from "@/lib/client/api";

type LiveDataContextValue = {
  asOf: string;
  snapshot: DashboardSnapshot | null;
  isRefreshing: boolean;
  lastError: string | null;
  refresh: () => Promise<void>;
};

const LiveDataContext = createContext<LiveDataContextValue | null>(null);

type LiveDataProviderProps = {
  initialAsOf: string;
  initialSnapshot: DashboardSnapshot;
  children: React.ReactNode;
};

export function LiveDataProvider({
  initialAsOf,
  initialSnapshot,
  children,
}: LiveDataProviderProps) {
  const [asOf, setAsOf] = useState(initialAsOf);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(initialSnapshot);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSnapshot();
      setAsOf(data.asOf);
      setSnapshot(data.snapshot);
      setLastError(null);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(refresh, DASHBOARD_POLL_MS);
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
    () => ({ asOf, snapshot, isRefreshing, lastError, refresh }),
    [asOf, snapshot, isRefreshing, lastError, refresh]
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

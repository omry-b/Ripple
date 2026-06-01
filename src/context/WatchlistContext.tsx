"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import {
  getWatchlistIds,
  setWatchlistIds,
  toggleWatchlistId as toggleLocal,
} from "@/lib/watchlist-storage";

type WatchlistContextValue = {
  ids: Set<string>;
  isSignedIn: boolean;
  isSyncing: boolean;
  toggle: (companyId: string) => void;
  addMany: (companyIds: string[]) => void;
  refresh: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

function WatchlistProviderInner({
  children,
  firebaseUserId,
  authReady,
}: {
  children: React.ReactNode;
  firebaseUserId: string | null;
  authReady: boolean;
}) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectiveUserId = firebaseUserId;

  const syncToServer = useCallback(
    async (companyIds: string[]) => {
      if (!effectiveUserId) return;
      setIsSyncing(true);
      try {
        await fetch("/api/watchlists/default", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ companyIds }),
        });
      } catch {
        /* local cache remains */
      } finally {
        setIsSyncing(false);
      }
    },
    [effectiveUserId]
  );

  const scheduleSync = useCallback(
    (companyIds: string[]) => {
      if (!effectiveUserId) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        void syncToServer(companyIds);
      }, 400);
    },
    [effectiveUserId, syncToServer]
  );

  const refresh = useCallback(async () => {
    if (effectiveUserId) {
      setIsSyncing(true);
      try {
        const res = await fetch("/api/watchlists/default", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as {
            watchlist: { companyIds: string[] };
          };
          const serverIds = data.watchlist.companyIds ?? [];
          setWatchlistIds(serverIds, effectiveUserId);
          setIds(new Set(serverIds));
          return;
        }
      } catch {
        /* fall through */
      } finally {
        setIsSyncing(false);
      }
    }
    setIds(new Set(getWatchlistIds(effectiveUserId)));
  }, [effectiveUserId]);

  useEffect(() => {
    if (!authReady) return;
    void refresh();
  }, [authReady, effectiveUserId, refresh]);

  useEffect(() => {
    const onChange = () => setIds(new Set(getWatchlistIds(effectiveUserId)));
    window.addEventListener("ripple-watchlist-change", onChange);
    return () => window.removeEventListener("ripple-watchlist-change", onChange);
  }, [effectiveUserId]);

  const toggle = useCallback(
    (companyId: string) => {
      const next = toggleLocal(companyId, effectiveUserId);
      setIds(new Set(next));
      scheduleSync(next);
    },
    [effectiveUserId, scheduleSync]
  );

  const addMany = useCallback(
    (companyIds: string[]) => {
      const merged = [...new Set([...getWatchlistIds(effectiveUserId), ...companyIds])];
      setWatchlistIds(merged, effectiveUserId);
      setIds(new Set(merged));
      scheduleSync(merged);
    },
    [effectiveUserId, scheduleSync]
  );

  const value = useMemo(
    () => ({
      ids,
      isSignedIn: Boolean(effectiveUserId),
      isSyncing,
      toggle,
      addMany,
      refresh,
    }),
    [ids, effectiveUserId, isSyncing, toggle, addMany, refresh]
  );

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
}

function WatchlistProviderWithFirebase({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  return (
    <WatchlistProviderInner
      firebaseUserId={user?.uid ?? null}
      authReady={!loading}
    >
      {children}
    </WatchlistProviderInner>
  );
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  if (isFirebaseClientConfigured()) {
    return <WatchlistProviderWithFirebase>{children}</WatchlistProviderWithFirebase>;
  }
  return (
    <WatchlistProviderInner firebaseUserId={null} authReady>
      {children}
    </WatchlistProviderInner>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return ctx;
}

export function useWatchlistOptional() {
  return useContext(WatchlistContext);
}

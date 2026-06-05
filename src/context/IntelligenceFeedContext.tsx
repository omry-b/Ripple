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
import type { IntelligenceFeedItem } from "@/types/domain";
import { fetchJsonWithRetry } from "@/lib/client/fetch-retry";

export type FeedScope = "all" | "watchlist";

export type FeedEntry = {
  items: IntelligenceFeedItem[];
  asOf: string | null;
  /** True only on the very first load of this scope (no data yet). */
  loading: boolean;
  /** True while a user-triggered or background refresh is in flight. */
  refreshing: boolean;
  error: string | null;
  /** Whether this scope has ever completed a load (so we don't auto-refetch). */
  loaded: boolean;
};

type LoadOptions = {
  refresh?: boolean;
  watchlistIds?: string[];
  /** Skip if this scope already has fresh data (used by the background prefetch). */
  ifStale?: boolean;
};

type IntelligenceFeedContextValue = {
  entries: Record<FeedScope, FeedEntry>;
  load: (scope: FeedScope, opts?: LoadOptions) => Promise<void>;
};

const EMPTY_ENTRY: FeedEntry = {
  items: [],
  asOf: null,
  loading: true,
  refreshing: false,
  error: null,
  loaded: false,
};

const IntelligenceFeedContext = createContext<IntelligenceFeedContextValue | null>(null);

const SESSION_KEY = "ripple-intel-feed-all";
// The server caches stories ~6h between scheduled crawls, so a session-restored
// feed older than this is refreshed in the background on the next open.
const STALE_MS = 6 * 60 * 60 * 1000;

type PersistedFeed = { items: IntelligenceFeedItem[]; asOf: string | null };

function readSession(): PersistedFeed | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedFeed;
  } catch {
    return null;
  }
}

function writeSession(feed: PersistedFeed) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(feed));
  } catch {
    /* sessionStorage may be unavailable (private mode / quota) */
  }
}

function isStale(asOf: string | null): boolean {
  if (!asOf) return true;
  const ts = new Date(asOf).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts > STALE_MS;
}

export function IntelligenceFeedProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Record<FeedScope, FeedEntry>>({
    all: EMPTY_ENTRY,
    watchlist: EMPTY_ENTRY,
  });
  // Guards against duplicate in-flight fetches for the same scope.
  const inFlight = useRef<Record<FeedScope, boolean>>({ all: false, watchlist: false });

  const patch = useCallback((scope: FeedScope, next: Partial<FeedEntry>) => {
    setEntries((prev) => ({ ...prev, [scope]: { ...prev[scope], ...next } }));
  }, []);

  const load = useCallback(
    async (scope: FeedScope, opts: LoadOptions = {}) => {
      const { refresh = false, watchlistIds = [], ifStale = false } = opts;
      if (inFlight.current[scope]) return;

      // Background prefetch: skip the network entirely if we already have
      // reasonably fresh data for this scope.
      if (ifStale) {
        const current = entries[scope];
        if (current.loaded && !isStale(current.asOf)) return;
      }

      inFlight.current[scope] = true;
      setEntries((prev) => {
        const cur = prev[scope];
        return {
          ...prev,
          [scope]: {
            ...cur,
            loading: cur.items.length === 0,
            refreshing: refresh || cur.items.length > 0,
            error: null,
          },
        };
      });

      try {
        const params = new URLSearchParams();
        if (refresh) params.set("refresh", "1");
        if (scope === "watchlist" && watchlistIds.length > 0) {
          params.set("watchlist", watchlistIds.join(","));
        }
        const path = `/api/intelligence/recent?${params.toString()}`;
        const raw = await fetchJsonWithRetry<Record<string, unknown>>(path);
        const data = (raw.data ?? raw) as {
          items: IntelligenceFeedItem[];
          asOf: string;
        };
        const items = data.items ?? [];
        const asOf = data.asOf ?? new Date().toISOString();
        patch(scope, { items, asOf, loading: false, refreshing: false, loaded: true });
        if (scope === "all") writeSession({ items, asOf });
      } catch (e) {
        patch(scope, {
          loading: false,
          refreshing: false,
          loaded: true,
          error: e instanceof Error ? e.message : "Could not load feed",
        });
      } finally {
        inFlight.current[scope] = false;
      }
    },
    [entries, patch]
  );

  // On first app open: hydrate from session for an instant feed, then warm the
  // "all" scope in the background so the Intelligence tab is ready before the
  // user ever navigates to it.
  useEffect(() => {
    const cached = readSession();
    if (cached && cached.items.length > 0) {
      setEntries((prev) => ({
        ...prev,
        all: {
          items: cached.items,
          asOf: cached.asOf,
          loading: false,
          refreshing: false,
          error: null,
          loaded: true,
        },
      }));
    }
    void load("all", { ifStale: true });
    // Intentionally run once on mount; `load` reads live state via setEntries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ entries, load }), [entries, load]);

  return (
    <IntelligenceFeedContext.Provider value={value}>
      {children}
    </IntelligenceFeedContext.Provider>
  );
}

export function useIntelligenceFeed() {
  const ctx = useContext(IntelligenceFeedContext);
  if (!ctx) {
    throw new Error("useIntelligenceFeed must be used within IntelligenceFeedProvider");
  }
  return ctx;
}

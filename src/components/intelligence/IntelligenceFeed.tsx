"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CompanyStorySource, IntelligenceFeedItem } from "@/types/domain";
import { formatAsOf } from "@/lib/format";
import { exportIntelligenceCsv } from "@/lib/export/entities";
import { fetchJsonWithRetry } from "@/lib/client/fetch-retry";
import { useWatchlist } from "@/context/WatchlistContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { levelFromStorySource } from "@/lib/intelligence/story-level";

const SOURCE_LABEL: Record<CompanyStorySource, string> = {
  news: "News",
  reddit: "Reddit",
  social: "Social",
  gdelt: "GDELT",
  hackernews: "HN",
  bbc: "BBC",
  sec: "SEC",
  npr: "NPR",
};

type ScopeFilter = "all" | "watchlist";
type SourceFilter = "all" | CompanyStorySource;

export function IntelligenceFeed() {
  const { ids: watchlistIds } = useWatchlist();
  const [items, setItems] = useState<IntelligenceFeedItem[]>([]);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (refresh) params.set("refresh", "1");
      if (scope === "watchlist" && watchlistIds.size > 0) {
        params.set("watchlist", [...watchlistIds].join(","));
      }
      const path = `/api/intelligence/recent?${params.toString()}`;
      const raw = await fetchJsonWithRetry<Record<string, unknown>>(path);
      const data = (raw.data ?? raw) as {
        items: IntelligenceFeedItem[];
        asOf: string;
      };
      setItems(data.items ?? []);
      setAsOf(data.asOf ?? new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [scope, watchlistIds]);

  useEffect(() => {
    void load(false);
  }, [load]);

  const filtered = useMemo(() => {
    let list = items;
    if (sourceFilter !== "all") {
      list = list.filter((i) => i.story.source === sourceFilter);
    }
    return list;
  }, [items, sourceFilter]);

  const sourceOptions = useMemo(() => {
    const set = new Set<CompanyStorySource>();
    for (const item of items) set.add(item.story.source);
    return [...set].sort();
  }, [items]);

  return (
    <section className="intelligence-feed surface-panel">
      <div className="company-stories-head">
        <p className="company-stories-intro">
          Cross-portfolio intelligence from the last <strong>24 hours</strong> (Google News,
          Reddit, GDELT, HN, BBC, SEC, NPR). Cached ~6h between scheduled crawls.
        </p>
        <div className="intelligence-feed-actions">
          <button
            type="button"
            className="filter-export-btn"
            onClick={() => void load(true)}
            disabled={refreshing || loading}
          >
            {refreshing ? "Crawling…" : "Refresh all"}
          </button>
          <button
            type="button"
            className="filter-export-btn"
            disabled={filtered.length === 0}
            onClick={() => exportIntelligenceCsv(filtered)}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="intelligence-filters" role="toolbar" aria-label="Feed filters">
        <div className="alerts-view-toggle">
          <button
            type="button"
            className={`alerts-view-btn${scope === "all" ? " active" : ""}`}
            onClick={() => setScope("all")}
          >
            Top risk
          </button>
          <button
            type="button"
            className={`alerts-view-btn${scope === "watchlist" ? " active" : ""}`}
            onClick={() => setScope("watchlist")}
            disabled={watchlistIds.size === 0}
          >
            Watchlist ({watchlistIds.size})
          </button>
        </div>
        <label className="intelligence-source-select">
          <span className="sr-only">Source</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>
            {sourceOptions.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="alerts-action-error" role="alert">
          <p>{error}</p>
          {error.toLowerCase().includes("auth") ? (
            <p style={{ marginTop: 8 }}>
              <Link href="/sign-in" className="text-link">
                Sign in
              </Link>{" "}
              to refresh stories, or browse in demo mode from the welcome page.
            </p>
          ) : null}
        </div>
      ) : null}
      {asOf ? (
        <p className="company-stories-cache-meta">
          Feed as of {formatAsOf(asOf)} · showing {filtered.length} items
        </p>
      ) : null}

      {scope === "watchlist" && watchlistIds.size === 0 ? (
        <EmptyState
          title="Watchlist is empty"
          description="Star companies on the companies page to see intelligence scoped to your portfolio."
          action={
            <Link href="/companies?watchlist=1" className="filter-export-btn">
              Open companies
            </Link>
          }
        />
      ) : loading && items.length === 0 ? (
        <p className="company-stories-empty">Loading intelligence feed…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No stories in this view"
          description="Run refresh to crawl the last 24 hours, or wait for the scheduled job."
          action={
            <button
              type="button"
              className="filter-export-btn"
              onClick={() => void load(true)}
              disabled={refreshing}
            >
              Refresh all
            </button>
          }
        />
      ) : (
        <ul className="timeline-feed">
          {filtered.map((item) => {
            const level = levelFromStorySource(item.story.source);
            return (
              <li
                key={`${item.companyId}-${item.story.id}`}
                className={`timeline-feed-item timeline-feed-item--${level}`}
              >
                <div className="intelligence-feed-item-head">
                  <Link href={`/companies/${item.companyId}`} className="intelligence-company-link">
                    {item.companyName}
                  </Link>
                  <span className="company-stories-badge">
                    {SOURCE_LABEL[item.story.source]}
                  </span>
                  <span className="intelligence-feed-time">
                    {formatAsOf(item.story.publishedAt)}
                  </span>
                </div>
                <a
                  href={item.story.url}
                  target="_blank"
                  rel="noreferrer"
                  className="company-stories-link"
                >
                  {item.story.title}
                </a>
                {item.story.summary ? (
                  <p className="company-stories-summary">{item.story.summary}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

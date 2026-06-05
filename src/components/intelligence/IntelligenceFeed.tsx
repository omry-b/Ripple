"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CompanyStorySource } from "@/types/domain";
import { formatAsOf } from "@/lib/format";
import { exportIntelligenceCsv } from "@/lib/export/entities";
import { useWatchlist } from "@/context/WatchlistContext";
import { useIntelligenceFeed } from "@/context/IntelligenceFeedContext";
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
  const { entries, load: loadScope } = useIntelligenceFeed();
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const entry = entries[scope];
  const { items, asOf, loading, refreshing, error } = entry;

  // The "all" scope is warmed in the background on app open, so it's usually
  // ready before the user ever arrives here — and it's kept in the provider, so
  // switching tabs never refetches it.
  const load = useCallback(
    (refresh = false) =>
      loadScope(scope, {
        refresh,
        watchlistIds: [...watchlistIds],
      }),
    [loadScope, scope, watchlistIds]
  );

  const watchlistKey = useMemo(() => [...watchlistIds].sort().join(","), [watchlistIds]);

  useEffect(() => {
    if (scope === "all") {
      // Only fetch if the background prefetch hasn't populated it yet.
      if (!entries.all.loaded) void loadScope("all");
    } else if (watchlistIds.size > 0) {
      // Watchlist is user-specific; (re)load when entering the scope or when
      // the starred set changes so it always reflects the current portfolio.
      void loadScope("watchlist", { watchlistIds: [...watchlistIds] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, watchlistKey, entries.all.loaded]);

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

"use client";

import { useCallback, useEffect, useState } from "react";
import type { CompanyStory } from "@/types/domain";
import { formatAsOf } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

const SOURCE_LABEL: Record<CompanyStory["source"], string> = {
  news: "Google News",
  reddit: "Reddit",
  social: "Social",
  gdelt: "GDELT",
  hackernews: "Hacker News",
  bbc: "BBC Business",
  sec: "SEC EDGAR",
  npr: "NPR Business",
};

type CompanyStoriesPanelClientProps = {
  companyId: string;
  companyName: string;
  initialStories: CompanyStory[];
  initialFetchedAt?: string;
};

export function CompanyStoriesPanelClient({
  companyId,
  companyName,
  initialStories,
  initialFetchedAt,
}: CompanyStoriesPanelClientProps) {
  const [stories, setStories] = useState(initialStories);
  const [fetchedAt, setFetchedAt] = useState(initialFetchedAt);
  const [sources, setSources] = useState<string[]>([]);
  const [sourceStats, setSourceStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCached = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies/${companyId}/stories`);
      const raw = (await res.json()) as Record<string, unknown>;
      if (!res.ok) return;
      const data = (raw.data ?? raw) as {
        stories: CompanyStory[];
        fetchedAt: string;
        sourcesQueried?: string[];
        sourceStats?: Record<string, number>;
      };
      setStories(data.stories);
      setFetchedAt(data.fetchedAt);
      if (data.sourcesQueried) setSources(data.sourcesQueried);
      if (data.sourceStats) setSourceStats(data.sourceStats);
    } catch {
      /* optional initial load */
    }
  }, [companyId]);

  useEffect(() => {
    void loadCached();
  }, [loadCached]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Force a fresh crawl via the public read endpoint (refresh is a read of
      // external news, not a user mutation — so it isn't role-gated). The
      // timestamp busts any CDN cache so the refresh is genuinely live.
      const res = await fetch(
        `/api/companies/${companyId}/stories?refresh=1&t=${Date.now()}`,
        { cache: "no-store" }
      );
      const raw = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const msg =
          typeof raw.error === "string" ? raw.error : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const data = (raw.data ?? raw) as {
        stories: CompanyStory[];
        fetchedAt: string;
        sourcesQueried?: string[];
        sourceStats?: Record<string, number>;
      };
      setStories(data.stories);
      setFetchedAt(data.fetchedAt);
      if (data.sourcesQueried) setSources(data.sourcesQueried);
      if (data.sourceStats) setSourceStats(data.sourceStats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return (
    <section className="surface-panel company-stories-panel">
      <div className="company-stories-head">
        <p className="company-stories-intro">
          External coverage in the <strong>last 24 hours</strong> from seven sources. Cached ~6h;
          use refresh for on-demand crawl.
        </p>
        <button
          type="button"
          className="filter-export-btn"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "Crawling…" : "Refresh stories"}
        </button>
      </div>
      {error ? (
        <p className="alerts-action-error" role="alert">
          {error}
        </p>
      ) : null}
      {fetchedAt ? (
        <p className="company-stories-cache-meta">
          Last fetched {formatAsOf(fetchedAt)}
          {sources.length > 0 ? ` · ${sources.length} sources queried` : ""}
        </p>
      ) : null}
      {Object.keys(sourceStats).length > 0 ? (
        <ul className="story-source-stats">
          {Object.entries(sourceStats).map(([name, count]) => (
            <li key={name} className={`integration-chip${count > 0 ? " on" : ""}`}>
              {name}: {count}
            </li>
          ))}
        </ul>
      ) : null}
      {stories.length === 0 ? (
        <EmptyState
          title="No stories in the last 24 hours"
          description={`Nothing matched for ${companyName} yet. Refresh to crawl all sources now.`}
          action={
            <button
              type="button"
              className="filter-export-btn"
              onClick={() => void refresh()}
              disabled={loading}
            >
              Refresh stories
            </button>
          }
        />
      ) : (
        <ul className="timeline-feed">
          {stories.map((story) => (
            <li key={story.id} className="timeline-feed-item timeline-feed-item--normal">
              <a
                href={story.url}
                target="_blank"
                rel="noreferrer"
                className="company-stories-link"
              >
                {story.title}
              </a>
              <div className="company-stories-meta">
                <span className="company-stories-badge">
                  {SOURCE_LABEL[story.source]}
                </span>
                <span>{formatAsOf(story.publishedAt)}</span>
              </div>
              {story.summary ? (
                <p className="company-stories-summary">{story.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

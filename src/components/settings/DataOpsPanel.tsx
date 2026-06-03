"use client";

import { useState } from "react";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { fetchJsonWithRetry } from "@/lib/client/fetch-retry";

export function DataOpsPanel() {
  const { role } = useDemoAuth();
  const [ingestMsg, setIngestMsg] = useState<string | null>(null);
  const [storiesMsg, setStoriesMsg] = useState<string | null>(null);
  const [pruneMsg, setPruneMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<"ingest" | "stories" | "prune" | null>(null);

  async function triggerIngest() {
    setBusy("ingest");
    setIngestMsg(null);
    try {
      const res = await fetch("/api/ingest/run", { method: "POST" });
      const raw = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const msg =
          typeof raw.error === "string" ? raw.error : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const total = raw.totalEvents as number | undefined;
      const pruned = raw.duplicatesPruned as number | undefined;
      setIngestMsg(
        `Ingest complete · ${total ?? 0} events${pruned != null ? ` · ${pruned} duplicate alerts pruned` : ""}`
      );
    } catch (e) {
      setIngestMsg(e instanceof Error ? e.message : "Ingest failed");
    } finally {
      setBusy(null);
    }
  }

  async function triggerPrune() {
    setBusy("prune");
    setPruneMsg(null);
    try {
      const res = await fetch("/api/alerts/prune-duplicates", { method: "POST" });
      const raw = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const msg =
          typeof raw.error === "string" ? raw.error : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const data = (raw.data ?? raw) as { pruned?: number };
      setPruneMsg(`Pruned ${data.pruned ?? 0} duplicate open alerts`);
    } catch (e) {
      setPruneMsg(e instanceof Error ? e.message : "Prune failed");
    } finally {
      setBusy(null);
    }
  }

  async function triggerStoriesWarm() {
    setBusy("stories");
    setStoriesMsg(null);
    try {
      const raw = await fetchJsonWithRetry<Record<string, unknown>>(
        "/api/intelligence/recent?refresh=1"
      );
      const data = (raw.data ?? raw) as { items?: unknown[]; companyCount?: number };
      setStoriesMsg(
        `Stories refreshed for ${data.companyCount ?? 8} companies · ${data.items?.length ?? 0} feed items`
      );
    } catch (e) {
      setStoriesMsg(e instanceof Error ? e.message : "Stories refresh failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="workbench-card data-ops-panel">
      <h3 className="supplier-tier-title">Data operations</h3>
      <p className="watchlist-manager-hint">
        Risk ingest runs every 6 hours on the edge scheduler. Story crawls run every 4 hours (last
        24h only). Use these buttons for on-demand refresh.
      </p>
      <div className="data-ops-actions">
        <button
          type="button"
          className="filter-export-btn"
          disabled={role === "viewer" || busy !== null}
          onClick={() => void triggerIngest()}
        >
          {busy === "ingest" ? "Running ingest…" : "Run risk ingest now"}
        </button>
        <button
          type="button"
          className="filter-export-btn"
          disabled={busy !== null}
          onClick={() => void triggerStoriesWarm()}
        >
          {busy === "stories" ? "Crawling stories…" : "Refresh intelligence crawl"}
        </button>
        {role === "admin" ? (
          <button
            type="button"
            className="filter-export-btn"
            disabled={busy !== null}
            onClick={() => void triggerPrune()}
          >
            {busy === "prune" ? "Pruning…" : "Prune duplicate alerts"}
          </button>
        ) : null}
      </div>
      {role === "viewer" ? (
        <p className="watchlist-manager-hint">
          Sign in as analyst or admin to run on-demand ingest and story crawls.
        </p>
      ) : null}
      {ingestMsg ? <p className="data-ops-result">{ingestMsg}</p> : null}
      {storiesMsg ? <p className="data-ops-result">{storiesMsg}</p> : null}
      {pruneMsg ? <p className="data-ops-result">{pruneMsg}</p> : null}
    </section>
  );
}

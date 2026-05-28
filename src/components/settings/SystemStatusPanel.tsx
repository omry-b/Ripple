"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OpsStatus = {
  dataMode: string;
  database: { connected: boolean; latencyMs?: number };
  snapshot: { asOf: string; openAlerts: number; activeStreams: number } | null;
  edge: {
    scheduler: string;
    worker: string;
    schedules: { cron: string; task: string }[];
  };
  scenarioJobs: { queued: number };
  recentIngest: Array<{
    adapter: string;
    status: string;
    eventsIngested: number;
    startedAt: string;
    message?: string;
  }>;
  integrations: Record<string, boolean>;
};

export function SystemStatusPanel() {
  const [ops, setOps] = useState<OpsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ops/status")
      .then((r) => r.json())
      .then((data: OpsStatus) => setOps(data))
      .catch(() => setError("Could not load system status"));
  }, []);

  if (error) {
    return <p className="empty-state-desc">{error}</p>;
  }

  if (!ops) {
    return <p className="empty-state-desc">Loading system status…</p>;
  }

  return (
    <div className="system-status-grid">
      <section className="workbench-card">
        <h3 className="supplier-tier-title">Data plane</h3>
        <ul className="system-status-list">
          <li>
            Mode: <strong>{ops.dataMode}</strong>
          </li>
          <li>
            Database:{" "}
            <strong>{ops.database.connected ? "connected" : "disconnected"}</strong>
            {ops.database.latencyMs != null && ` (${ops.database.latencyMs}ms)`}
          </li>
          {ops.snapshot && (
            <li>
              Snapshot as of <time dateTime={ops.snapshot.asOf}>{ops.snapshot.asOf}</time> ·{" "}
              {ops.snapshot.openAlerts} open alerts · {ops.snapshot.activeStreams} streams
            </li>
          )}
        </ul>
      </section>

      <section className="workbench-card">
        <h3 className="supplier-tier-title">Edge scheduler (Cloudflare)</h3>
        <p className="watchlist-manager-hint">
          Worker <code>{ops.edge.worker}</code> calls this Vercel app on a schedule.
        </p>
        <ul className="system-status-list">
          {ops.edge.schedules.map((s) => (
            <li key={s.cron}>
              <code>{s.cron}</code> → {s.task}
            </li>
          ))}
        </ul>
      </section>

      <section className="workbench-card">
        <h3 className="supplier-tier-title">Scenario jobs</h3>
        <p className="watchlist-manager-hint">
          Queued async simulations: <strong>{ops.scenarioJobs.queued}</strong> (drained every 5
          min by Cloudflare).
        </p>
      </section>

      <section className="workbench-card">
        <h3 className="supplier-tier-title">Recent ingest runs</h3>
        {ops.recentIngest.length === 0 ? (
          <p className="watchlist-manager-hint">
            No runs yet — next ingest fires on the 6-hour Cloudflare schedule, or trigger{" "}
            <Link href="/api-docs">POST /api/ingest/internal</Link> with service auth.
          </p>
        ) : (
          <ul className="system-status-list">
            {ops.recentIngest.map((r) => (
              <li key={r.startedAt + r.adapter}>
                <strong>{r.adapter}</strong> · {r.status} · {r.eventsIngested} events ·{" "}
                <time dateTime={r.startedAt}>{r.startedAt}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="workbench-card">
        <h3 className="supplier-tier-title">Integrations</h3>
        <ul className="system-status-list integrations-list">
          {Object.entries(ops.integrations).map(([key, on]) => (
            <li key={key}>
              {on ? "✓" : "—"} {key}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

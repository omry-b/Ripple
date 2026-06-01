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

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`status-pill ${ok ? "status-pill-ok" : "status-pill-off"}`}>{label}</span>
  );
}

function ingestPillClass(status: string) {
  if (status === "success" || status === "ok") return "status-pill-ok";
  if (status === "running" || status === "partial") return "status-pill-warn";
  return "status-pill-off";
}

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

  const dbOk = ops.database.connected;
  const isLive = ops.dataMode === "postgres" || ops.dataMode === "live";

  return (
    <div className="system-status-grid">
      <section className="workbench-card">
        <div className="system-status-card-head">
          <h3 className="supplier-tier-title">Data plane</h3>
          <div className="system-status-pills">
            <StatusPill ok={isLive} label={ops.dataMode} />
            <StatusPill ok={dbOk} label={dbOk ? "DB connected" : "DB offline"} />
          </div>
        </div>
        <ul className="system-status-list">
          {ops.database.latencyMs != null && (
            <li>
              Query latency: <strong>{ops.database.latencyMs}ms</strong>
            </li>
          )}
          {ops.snapshot && (
            <li>
              Snapshot as of <time dateTime={ops.snapshot.asOf}>{ops.snapshot.asOf}</time> ·{" "}
              {ops.snapshot.openAlerts} open alerts · {ops.snapshot.activeStreams} streams
            </li>
          )}
        </ul>
      </section>

      <section className="workbench-card">
        <div className="system-status-card-head">
          <h3 className="supplier-tier-title">Edge scheduler (Cloudflare)</h3>
          <StatusPill ok label="Active" />
        </div>
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
        <div className="system-status-card-head">
          <h3 className="supplier-tier-title">Scenario jobs</h3>
          <span
            className={`status-pill ${ops.scenarioJobs.queued > 0 ? "status-pill-warn" : "status-pill-ok"}`}
          >
            {ops.scenarioJobs.queued} queued
          </span>
        </div>
        <p className="watchlist-manager-hint">
          Async simulations drain every 5 minutes via the Cloudflare scenario-worker cron.
        </p>
      </section>

      <section className="workbench-card">
        <h3 className="supplier-tier-title">Recent ingest runs</h3>
        {ops.recentIngest.length === 0 ? (
          <p className="watchlist-manager-hint">
            No runs yet  -  next ingest fires on the 6-hour Cloudflare schedule, or trigger{" "}
            <Link href="/api-docs" className="text-link">
              POST /api/ingest/internal
            </Link>{" "}
            with service auth.
          </p>
        ) : (
          <ul className="system-status-list system-ingest-list">
            {ops.recentIngest.map((r) => (
              <li key={r.startedAt + r.adapter}>
                <span className={`status-pill ${ingestPillClass(r.status)}`}>{r.status}</span>
                <strong>{r.adapter}</strong> · {r.eventsIngested} events ·{" "}
                <time dateTime={r.startedAt}>{r.startedAt}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="workbench-card system-integrations-card">
        <h3 className="supplier-tier-title">Integrations</h3>
        <ul className="integration-chips">
          {Object.entries(ops.integrations).map(([key, on]) => (
            <li key={key} className={`integration-chip${on ? " on" : ""}`}>
              {key.replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

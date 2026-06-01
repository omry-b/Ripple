import { getDataSource } from "@/lib/data";
import { getDataSourceMode } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db/client";
import { pingDatabase } from "@/lib/db/ping";
import { isAuthEnabled } from "@/lib/auth/config";
import { INGEST_ADAPTERS } from "@/lib/ingest/registry";
import { listQueuedScenarioJobs } from "@/lib/scenario/job-store";

export async function GET() {
  const dbPing = await pingDatabase();
  const data = await getDataSource();
  const [snapshot, ingestRuns, queuedJobs] = await Promise.all([
    data.getSnapshot().catch(() => null),
    data.getIngestRuns(5).catch(() => []),
    listQueuedScenarioJobs(20),
  ]);

  return Response.json({
    status: dbPing.ok || !isDatabaseConfigured() ? "ok" : "degraded",
    asOf: new Date().toISOString(),
    dataMode: getDataSourceMode(),
    database: {
      configured: isDatabaseConfigured(),
      connected: dbPing.ok,
      latencyMs: dbPing.latencyMs,
      error: dbPing.error,
    },
    snapshot: snapshot
      ? {
          asOf: snapshot.asOf,
          openAlerts: snapshot.openAlertsCount,
          activeStreams: snapshot.activeStreamsCount,
        }
      : null,
    edge: {
      scheduler: "cloudflare-workers",
      worker: "ripple-cron",
      schedules: [
            { cron: "*/5 * * * *", task: "scenario-worker" },
            { cron: "0 */6 * * *", task: "ingest" },
            { cron: "0 12 * * *", task: "daily-maintenance" },
          ],
      vercelCronBackup: "/api/cron/daily",
    },
    scenarioJobs: {
      queued: queuedJobs.length,
      ids: queuedJobs.map((j) => j.id),
    },
    recentIngest: ingestRuns.map((r) => ({
      id: r.id,
      adapter: r.adapter,
      status: r.status,
      eventsIngested: r.eventsIngested,
      startedAt: r.startedAt,
      message: r.message,
    })),
    ingestAdapters: INGEST_ADAPTERS.map((a) => a.name),
    auth: isAuthEnabled() ? "firebase" : "demo",
    integrations: {
      mapbox: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
      kv: Boolean(process.env.KV_REST_API_URL),
      slack: Boolean(process.env.SLACK_WEBHOOK_URL),
      resend: Boolean(process.env.RESEND_API_KEY),
      pagerduty: Boolean(process.env.PAGERDUTY_ROUTING_KEY),
      firebase: isAuthEnabled(),
    },
  });
}

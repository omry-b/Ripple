import { getDataSourceMode } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db/client";
import { pingDatabase } from "@/lib/db/ping";
import { isAuthEnabled } from "@/lib/auth/config";
import { INGEST_ADAPTERS } from "@/lib/ingest/registry";
import { listQueuedScenarioJobs } from "@/lib/scenario/job-store";

export async function GET() {
  const dbPing = await pingDatabase();
  const queuedJobs = (await listQueuedScenarioJobs(100)).length;

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
    auth: isAuthEnabled() ? "clerk" : "demo",
    scenarioJobsQueued: queuedJobs,
    ingestAdapters: INGEST_ADAPTERS.map((a) => a.name),
    env: {
      mapbox: Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
      kv: Boolean(process.env.KV_REST_API_URL),
      slack: Boolean(process.env.SLACK_WEBHOOK_URL),
      clerk: Boolean(process.env.CLERK_SECRET_KEY),
    },
  });
}

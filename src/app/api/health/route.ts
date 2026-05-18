import { getDataSourceMode } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db/client";
import { isAuthEnabled } from "@/lib/auth/config";
import { INGEST_ADAPTERS } from "@/lib/ingest/registry";

export async function GET() {
  return Response.json({
    status: "ok",
    asOf: new Date().toISOString(),
    dataMode: getDataSourceMode(),
    database: isDatabaseConfigured() ? "configured" : "mock-fallback",
    auth: isAuthEnabled() ? "clerk-ready" : "demo",
    ingestAdapters: INGEST_ADAPTERS.map((a) => ({
      name: a.name,
      description: a.description,
    })),
    placeholders: {
      ais: !process.env.AIS_API_KEY,
      gdelt: !process.env.GDELT_API_KEY,
      slack: !process.env.SLACK_WEBHOOK_URL,
      clerk: !process.env.CLERK_SECRET_KEY,
    },
  });
}

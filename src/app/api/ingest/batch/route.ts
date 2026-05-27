import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { runIngestFromEvents } from "@/lib/ingest/pipeline";
import type { NormalizedIngestEvent } from "@/lib/ingest/types";

/** Pre-normalized events from edge workers / queue consumers (Bearer CRON_SECRET). */
export async function POST(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    events?: NormalizedIngestEvent[];
    source?: string;
  };

  if (!body.events?.length) {
    return Response.json({ error: "events array required" }, { status: 400 });
  }

  const result = await runIngestFromEvents(body.events, { source: body.source });
  return Response.json({ asOf: new Date().toISOString(), ...result });
}

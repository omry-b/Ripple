import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { runIngestPipeline } from "@/lib/ingest/pipeline";

/** Six-hour risk ingest (adapters + dedupe + snapshot). */
export async function GET(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runIngestPipeline();
  return Response.json({
    asOf: new Date().toISOString(),
    task: "ingest-scheduled",
    ...result,
  });
}

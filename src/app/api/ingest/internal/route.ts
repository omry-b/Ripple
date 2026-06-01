import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { runIngestPipeline } from "@/lib/ingest/pipeline";

export const maxDuration = 60;

/** Full ingest pipeline  -  call from Cloudflare cron or DO worker (Bearer CRON_SECRET). */
export async function POST(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let adapters: string[] | undefined;
  try {
    const body = (await request.json()) as { adapters?: string[] };
    if (body?.adapters?.length) adapters = body.adapters;
  } catch {
    /* all adapters */
  }

  const result = await runIngestPipeline(adapters);
  return Response.json({ asOf: new Date().toISOString(), ...result });
}

export async function GET(request: Request) {
  return POST(request);
}

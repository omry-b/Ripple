import { getSessionUser } from "@/lib/auth/session";
import { runIngestPipeline } from "@/lib/ingest/pipeline";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (user.role === "viewer") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let adapters: string[] | undefined;
  try {
    const body = await request.json();
    if (body?.adapters && Array.isArray(body.adapters)) {
      adapters = body.adapters as string[];
    }
  } catch {
    /* run all adapters */
  }

  const result = await runIngestPipeline(adapters);

  return Response.json({
    asOf: new Date().toISOString(),
    triggeredBy: user.id,
    ...result,
  });
}

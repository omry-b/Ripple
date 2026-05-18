import { runScenario } from "@/lib/api";
import { jsonData, jsonError } from "@/lib/api/response";
import { enqueueScenarioJob } from "@/lib/scenario/job-queue";
import type { ScenarioRunOptions } from "@/types/domain";

type Params = { params: Promise<{ id: string }> };

function parseOptions(body: unknown): ScenarioRunOptions | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  return {
    severity: typeof b.severity === "number" ? b.severity : undefined,
    durationDays: typeof b.durationDays === "number" ? b.durationDays : undefined,
    region:
      b.region === "APAC" || b.region === "EMEA" || b.region === "AMER"
        ? b.region
        : undefined,
    cvarLevel: b.cvarLevel === 99 ? 99 : b.cvarLevel === 95 ? 95 : undefined,
  };
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const asyncMode = url.searchParams.get("async") === "true";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }

  const options = parseOptions(body);
  const wantsAsync =
    asyncMode || (body && typeof body === "object" && (body as { async?: boolean }).async);

  if (wantsAsync) {
    const job = enqueueScenarioJob(id, options);
    return jsonData({ job }, 202);
  }

  const run = await runScenario(id, options);
  if (!run) {
    return jsonError("Scenario not found", 404);
  }

  return jsonData({ run });
}

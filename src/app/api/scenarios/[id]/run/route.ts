import { runScenario } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  let options: { severity?: number; durationDays?: number } | undefined;
  try {
    const body = await request.json();
    if (body && typeof body === "object") {
      options = {
        severity: typeof body.severity === "number" ? body.severity : undefined,
        durationDays: typeof body.durationDays === "number" ? body.durationDays : undefined,
      };
    }
  } catch {
    /* empty body is fine */
  }
  const run = await runScenario(id, options);

  if (!run) {
    return Response.json({ error: "Scenario not found" }, { status: 404 });
  }

  return Response.json({ asOf: new Date().toISOString(), run });
}

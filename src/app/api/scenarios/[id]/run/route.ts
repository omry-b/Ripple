import { runScenario } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const run = await runScenario(id);

  if (!run) {
    return Response.json({ error: "Scenario not found" }, { status: 404 });
  }

  return Response.json({ asOf: new Date().toISOString(), run });
}

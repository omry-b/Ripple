import { acknowledgeAlert, getAlert } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const alert = await getAlert(id);
  if (!alert) {
    return Response.json({ error: "Alert not found" }, { status: 404 });
  }
  return Response.json({ asOf: new Date().toISOString(), alert });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { action?: string };

  if (body.action === "acknowledge") {
    const alert = await acknowledgeAlert(id);
    if (!alert) {
      return Response.json({ error: "Alert not found" }, { status: 404 });
    }
    return Response.json({ asOf: new Date().toISOString(), alert });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

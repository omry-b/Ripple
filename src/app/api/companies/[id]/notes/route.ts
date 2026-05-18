import { getDataSource } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser(request);
  const data = await getDataSource();
  const note = await data.getCompanyNote(id, user.id);
  return Response.json({ asOf: new Date().toISOString(), companyId: id, note: note ?? "" });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser(request);
  const body = (await request.json()) as { note?: string };
  const data = await getDataSource();
  await data.setCompanyNote(id, user.id, body.note ?? "");
  return Response.json({ asOf: new Date().toISOString(), companyId: id, saved: true });
}

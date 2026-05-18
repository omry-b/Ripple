import { getDataSource } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  await getSessionUser(request);
  const body = (await request.json()) as { companyIds?: string[]; name?: string };

  const data = await getDataSource();
  if (body.companyIds) {
    const watchlist = await data.setWatchlistCompanies(id, body.companyIds);
    if (!watchlist) {
      return Response.json({ error: "Watchlist not found" }, { status: 404 });
    }
    return Response.json({ asOf: new Date().toISOString(), watchlist });
  }

  return Response.json({ error: "No supported fields" }, { status: 400 });
}

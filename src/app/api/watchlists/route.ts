import { getDataSource } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  const data = await getDataSource();
  const watchlists = await data.getWatchlists(user.id);
  return Response.json({ asOf: new Date().toISOString(), watchlists });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  const body = (await request.json()) as { name?: string; companyIds?: string[] };
  const data = await getDataSource();
  const watchlist = await data.createWatchlist(user.id, body.name ?? "Watchlist");

  if (body.companyIds?.length) {
    const updated = await data.setWatchlistCompanies(watchlist.id, body.companyIds);
    return Response.json({ asOf: new Date().toISOString(), watchlist: updated });
  }

  return Response.json({ asOf: new Date().toISOString(), watchlist });
}

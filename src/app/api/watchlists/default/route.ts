import { getDataSource } from "@/lib/data";
import { defaultWatchlistId, ensureUserRecord } from "@/lib/auth/ensure-user";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  await ensureUserRecord(user);
  const data = await getDataSource();
  const watchlistId = defaultWatchlistId(user.id);
  const lists = await data.getWatchlists(user.id);
  let watchlist = lists.find((w) => w.id === watchlistId) ?? lists[0];

  if (!watchlist) {
    watchlist = await data.createWatchlist(user.id, "My watchlist", watchlistId);
  }

  return Response.json({ asOf: new Date().toISOString(), watchlist });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser(request);
  await ensureUserRecord(user);
  const body = (await request.json()) as { companyIds?: string[] };
  if (!body.companyIds) {
    return Response.json({ error: "companyIds required" }, { status: 400 });
  }

  const data = await getDataSource();
  const watchlistId = defaultWatchlistId(user.id);
  const lists = await data.getWatchlists(user.id);
  if (!lists.some((w) => w.id === watchlistId)) {
    await data.createWatchlist(user.id, "My watchlist", watchlistId);
  }

  const watchlist = await data.setWatchlistCompanies(watchlistId, body.companyIds);
  if (!watchlist) {
    return Response.json({ error: "Watchlist not found" }, { status: 404 });
  }

  return Response.json({ asOf: new Date().toISOString(), watchlist });
}

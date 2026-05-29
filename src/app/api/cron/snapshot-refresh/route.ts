import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { invalidateSnapshotCache } from "@/lib/cache/snapshot-cache";
import { refreshSnapshot } from "@/lib/api";

export const maxDuration = 30;

/** Recompute dashboard snapshot KPIs from current Postgres rows (every-5-min cron). */
export async function GET(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await refreshSnapshot();
  invalidateSnapshotCache();

  return Response.json({
    asOf: new Date().toISOString(),
    snapshotAsOf: snapshot.asOf,
    openAlerts: snapshot.openAlertsCount,
    activeStreams: snapshot.activeStreamsCount,
  });
}

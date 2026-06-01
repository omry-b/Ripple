/**
 * One-off: refresh Postgres snapshot + run ingest (use with DATABASE_URL set).
 * Usage: DATABASE_URL=... CRON_SECRET=... npx tsx scripts/refresh-live.ts
 */
import { reconcileStaleIngestRuns } from "@/lib/ingest/reconcile-runs";
import { runIngestPipeline } from "@/lib/ingest/pipeline";
import { getDataSource } from "@/lib/data";
import { invalidateSnapshotCache } from "@/lib/cache/snapshot-cache";
import { closeDb } from "@/lib/db/client";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  console.log("Reconciling stale ingest runs…");
  const reconciled = await reconcileStaleIngestRuns();
  console.log(`  reconciled: ${reconciled}`);

  const data = await getDataSource();
  console.log("Refreshing snapshot…");
  const snapshot = await data.refreshSnapshot();
  invalidateSnapshotCache();
  console.log(`  snapshot.asOf: ${snapshot.asOf}`);

  console.log("Running ingest pipeline…");
  const result = await runIngestPipeline();
  console.log(JSON.stringify(result, null, 2));

  const after = await data.refreshSnapshot();
  console.log(`Done. snapshot.asOf: ${after.asOf}`);
}

main()
  .then(() => closeDb())
  .catch(async (e) => {
    console.error(e);
    await closeDb().catch(() => {});
    process.exit(1);
  });

import { and, eq, lt } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

const STALE_RUN_MS = 15 * 60 * 1000;

/** Mark ingest runs left in `running` after a serverless timeout or crash. */
export async function reconcileStaleIngestRuns(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;

  const db = getDb();
  const cutoff = new Date(Date.now() - STALE_RUN_MS);
  const updated = await db
    .update(schema.ingestRuns)
    .set({
      status: "failed",
      finishedAt: new Date(),
      message: "Timed out or interrupted (reconciled)",
    })
    .where(
      and(eq(schema.ingestRuns.status, "running"), lt(schema.ingestRuns.startedAt, cutoff))
    )
    .returning({ id: schema.ingestRuns.id });

  return updated.length;
}

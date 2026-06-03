/**
 * Bring the database's company roster in line with the canonical roster in code
 * (`mockStore`). Existing seeds predate the real-company roster, so production
 * still shows legacy "SupplyCo N" rows; this upserts the real companies and
 * prunes anything no longer in the roster (clearing FK references first).
 *
 *   npm run db:reconcile         # dry run — prints the plan, changes nothing
 *   npm run db:reconcile -- --apply
 *
 * Idempotent: re-running after a roster change re-syncs the DB.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { inArray } from "drizzle-orm";
import { getDb, isDatabaseConfigured, closeDb } from "../src/lib/db/client";
import * as schema from "../src/lib/db/schema";
import { mockStore } from "../src/lib/mock/store";
import { DEMO_ORG_ID } from "../src/lib/db/seed";

async function main() {
  const apply = process.argv.includes("--apply");

  if (!isDatabaseConfigured()) {
    console.error("FAIL: DATABASE_URL is not set");
    process.exit(1);
  }

  const db = getDb();
  const desired = mockStore.getCompanies();
  const desiredIds = new Set(desired.map((c) => c.id));

  const existing = await db.select().from(schema.companies);
  const existingIds = existing.map((c) => c.id);
  const staleIds = existingIds.filter((id) => !desiredIds.has(id));
  const newIds = desired.filter((c) => !existingIds.includes(c.id)).map((c) => c.id);

  console.log(`Roster: ${desired.length} companies in code, ${existing.length} in DB.`);
  console.log(`  ${newIds.length} new to insert: ${newIds.join(", ") || "(none)"}`);
  console.log(`  ${staleIds.length} stale to prune: ${staleIds.join(", ") || "(none)"}`);
  console.log(`  ${desired.length - newIds.length} existing to update (names/scores).`);

  if (!apply) {
    console.log("\nDry run — no changes written. Re-run with --apply to execute.");
    await closeDb();
    return;
  }

  await db.transaction(async (tx) => {
    // Upsert the canonical roster.
    for (const c of desired) {
      const row = {
        id: c.id,
        name: c.name,
        score: c.score,
        tier: c.tier,
        cvar: c.cvar,
        cvarUsd: c.cvarUsd,
        delta7d: c.delta7d,
        deltaTrend: c.deltaTrend,
        contagionHops: c.contagionHops,
        scoreLevel: c.scoreLevel,
        history30d: c.history30d,
        organizationId: DEMO_ORG_ID,
      };
      await tx
        .insert(schema.companies)
        .values(row)
        .onConflictDoUpdate({
          target: schema.companies.id,
          set: {
            name: row.name,
            score: row.score,
            tier: row.tier,
            cvar: row.cvar,
            cvarUsd: row.cvarUsd,
            delta7d: row.delta7d,
            deltaTrend: row.deltaTrend,
            contagionHops: row.contagionHops,
            scoreLevel: row.scoreLevel,
            history30d: row.history30d,
            organizationId: row.organizationId,
          },
        });
    }

    // Prune stale companies after clearing their FK references.
    if (staleIds.length > 0) {
      await tx
        .delete(schema.watchlistCompanies)
        .where(inArray(schema.watchlistCompanies.companyId, staleIds));
      await tx
        .delete(schema.companyNotes)
        .where(inArray(schema.companyNotes.companyId, staleIds));
      await tx.delete(schema.companies).where(inArray(schema.companies.id, staleIds));
    }
  });

  const after = await db.select({ id: schema.companies.id }).from(schema.companies);
  console.log(`\nDone. DB now holds ${after.length} companies, in sync with code.`);
  await closeDb();
}

main().catch((e) => {
  console.error("Reconcile failed:", e);
  process.exit(1);
});

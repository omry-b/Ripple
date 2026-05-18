import { sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";

export type DbPingResult = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
};

export async function pingDatabase(): Promise<DbPingResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "DATABASE_URL not configured" };
  }
  const start = Date.now();
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Database ping failed",
      latencyMs: Date.now() - start,
    };
  }
}

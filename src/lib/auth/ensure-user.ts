import { eq } from "drizzle-orm";
import { isFirebaseConfigured } from "@/lib/auth/firebase-config";
import type { SessionUser } from "@/lib/auth/session";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

const DEFAULT_WATCHLIST_NAME = "My watchlist";

export async function ensureUserRecord(user: SessionUser): Promise<void> {
  if (!isFirebaseConfigured() || !isDatabaseConfigured()) return;
  if (user.id === "user_demo" || user.id === "anonymous") return;

  const db = getDb();
  const orgId = user.organizationId || `personal_${user.id}`;
  const orgName =
    orgId.startsWith("personal_") ? "Personal workspace" : "Organization";

  await db
    .insert(schema.organizations)
    .values({ id: orgId, name: orgName })
    .onConflictDoNothing();

  await db
    .insert(schema.users)
    .values({
      id: user.id,
      email: user.email,
      organizationId: orgId,
      role: user.role,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email: user.email,
        organizationId: orgId,
        role: user.role,
      },
    });

  const watchlistId = defaultWatchlistId(user.id);
  const [existing] = await db
    .select()
    .from(schema.watchlists)
    .where(eq(schema.watchlists.id, watchlistId))
    .limit(1);

  if (!existing) {
    await db.insert(schema.watchlists).values({
      id: watchlistId,
      userId: user.id,
      name: DEFAULT_WATCHLIST_NAME,
    });
  }
}

export function defaultWatchlistId(userId: string): string {
  return `wl_${userId}_default`;
}

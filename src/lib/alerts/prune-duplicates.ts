import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import type { Alert } from "@/types/domain";
import { getAlerts } from "@/lib/api";
import { alertState } from "@/lib/mock/alert-state";

/** Keep one open alert per normalized title; resolve the rest. */
export async function pruneDuplicateOpenAlerts(): Promise<number> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.alerts)
      .where(eq(schema.alerts.status, "open"));

    const groups = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.title.trim().toLowerCase();
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }

    let pruned = 0;
    for (const [, group] of groups) {
      if (group.length <= 1) continue;
      const sorted = [...group].sort((a, b) => {
        const levelScore = (l: string) =>
          l === "critical" ? 2 : l === "elevated" ? 1 : 0;
        return levelScore(b.level) - levelScore(a.level);
      });
      const [, ...dupes] = sorted;
      for (const dup of dupes) {
        await db
          .update(schema.alerts)
          .set({
            status: "resolved",
            statusLabel: "Resolved (duplicate)",
          })
          .where(eq(schema.alerts.id, dup.id));
        pruned += 1;
      }
    }
    return pruned;
  }

  const alerts = await getAlerts();
  const open = alerts.filter((a) => a.status === "open");
  const groups = new Map<string, Alert[]>();
  for (const a of open) {
    const key = a.title.trim().toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }

  let pruned = 0;
  for (const [, group] of groups) {
    if (group.length <= 1) continue;
    const [, ...dupes] = group;
    for (const dup of dupes) {
      alertState.resolve(dup.id);
      pruned += 1;
    }
  }
  return pruned;
}

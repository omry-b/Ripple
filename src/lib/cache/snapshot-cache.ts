import type { DashboardSnapshot } from "@/types/domain";
import { kvDeleteSnapshot, kvGetSnapshot, kvSetSnapshot } from "@/lib/cache/kv-snapshot";
import { isDatabaseConfigured } from "@/lib/db/client";

const TTL_MS = 60_000;
let memoryCache: { snapshot: DashboardSnapshot; expiresAt: number } | null = null;

export async function getCachedSnapshot(
  loader: () => Promise<DashboardSnapshot>
): Promise<DashboardSnapshot> {
  if (isDatabaseConfigured()) {
    return loader();
  }

  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.snapshot;
  }

  const fromKv = await kvGetSnapshot();
  if (fromKv) {
    memoryCache = { snapshot: fromKv, expiresAt: now + TTL_MS };
    return fromKv;
  }

  const snapshot = await loader();
  memoryCache = { snapshot, expiresAt: now + TTL_MS };
  void kvSetSnapshot(snapshot, 60);
  return snapshot;
}

export function invalidateSnapshotCache(): void {
  memoryCache = null;
  void kvDeleteSnapshot();
}

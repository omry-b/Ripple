import type { DashboardSnapshot } from "@/types/domain";

const TTL_MS = 60_000;
let memoryCache: { snapshot: DashboardSnapshot; expiresAt: number } | null = null;

export async function getCachedSnapshot(
  loader: () => Promise<DashboardSnapshot>
): Promise<DashboardSnapshot> {
  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.snapshot;
  }

  const snapshot = await loader();
  memoryCache = { snapshot, expiresAt: now + TTL_MS };
  return snapshot;
}

export function invalidateSnapshotCache(): void {
  memoryCache = null;
}

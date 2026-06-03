/**
 * Per-company dollar-exposure storage for a user's portfolio.
 *
 * The *which companies* live in the watchlist (`watchlist-storage.ts`); this
 * layer adds the *how much* — the annual spend / value-at-risk a user has with
 * each company. It is the piece that turns a generic demo dashboard into "my
 * portfolio": once exposures exist, every risk number can be scoped to the
 * user's actual book. Stored client-side so it works with zero backend.
 */

const LEGACY_KEY = "ripple-portfolio";

export type ExposureMap = Record<string, number>;

function storageKey(userId?: string | null): string {
  if (userId && userId !== "user_demo") return `ripple-portfolio:${userId}`;
  return LEGACY_KEY;
}

export function getExposures(userId?: string | null): ExposureMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExposureMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setExposures(map: ExposureMap, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(map));
  window.dispatchEvent(new CustomEvent("ripple-portfolio-change"));
}

export function setExposure(
  companyId: string,
  exposureUsd: number | null,
  userId?: string | null
): ExposureMap {
  const map = getExposures(userId);
  if (exposureUsd == null || !Number.isFinite(exposureUsd) || exposureUsd <= 0) {
    delete map[companyId];
  } else {
    map[companyId] = exposureUsd;
  }
  setExposures(map, userId);
  return map;
}

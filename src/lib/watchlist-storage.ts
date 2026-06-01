const LEGACY_KEY = "ripple-watchlist";

function storageKey(userId?: string | null): string {
  if (userId && userId !== "user_demo") return `ripple-watchlist:${userId}`;
  return LEGACY_KEY;
}

export function getWatchlistIds(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = storageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw && key !== LEGACY_KEY) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        localStorage.setItem(key, legacy);
        return JSON.parse(legacy) as string[];
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setWatchlistIds(ids: string[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent("ripple-watchlist-change"));
}

export function toggleWatchlistId(id: string, userId?: string | null): string[] {
  const current = getWatchlistIds(userId);
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  setWatchlistIds(next, userId);
  return next;
}

export function addToWatchlist(ids: string[], userId?: string | null): string[] {
  const next = [...new Set([...getWatchlistIds(userId), ...ids])];
  setWatchlistIds(next, userId);
  return next;
}

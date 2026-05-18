const STORAGE_KEY = "ripple-watchlist";

export function getWatchlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setWatchlistIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

export function toggleWatchlistId(id: string): string[] {
  const current = getWatchlistIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  setWatchlistIds(next);
  window.dispatchEvent(new CustomEvent("ripple-watchlist-change"));
  return next;
}

export function addToWatchlist(ids: string[]): string[] {
  const next = [...new Set([...getWatchlistIds(), ...ids])];
  setWatchlistIds(next);
  window.dispatchEvent(new CustomEvent("ripple-watchlist-change"));
  return next;
}

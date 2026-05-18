export type RecentItem = {
  id: string;
  label: string;
  href: string;
  group: string;
  visitedAt: number;
};

const STORAGE_KEY = "ripple-cmdk-recent";
const MAX_RECENT = 6;

export function getRecentItems(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushRecentItem(item: Omit<RecentItem, "visitedAt">): void {
  if (typeof window === "undefined") return;
  const entry: RecentItem = { ...item, visitedAt: Date.now() };
  const list = getRecentItems().filter((r) => r.href !== entry.href);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

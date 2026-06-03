import type { CompanyStory } from "@/types/domain";
import { STORY_CACHE_TTL_MS } from "./constants";

export type StoryCacheEntry = {
  stories: CompanyStory[];
  fetchedAt: string;
  sourcesQueried: string[];
};

const cache = new Map<string, StoryCacheEntry>();

export function getStoryCache(companyId: string): StoryCacheEntry | undefined {
  return cache.get(companyId);
}

export function setStoryCache(
  companyId: string,
  stories: CompanyStory[],
  sourcesQueried: string[]
): StoryCacheEntry {
  const entry: StoryCacheEntry = {
    stories,
    fetchedAt: new Date().toISOString(),
    sourcesQueried,
  };
  cache.set(companyId, entry);
  return entry;
}

export function isStoryCacheFresh(entry: StoryCacheEntry): boolean {
  const age = Date.now() - new Date(entry.fetchedAt).getTime();
  return age < STORY_CACHE_TTL_MS;
}

export function clearStoryCache(companyId?: string): void {
  if (companyId) cache.delete(companyId);
  else cache.clear();
}

export function listCachedCompanyIds(): string[] {
  return [...cache.keys()];
}

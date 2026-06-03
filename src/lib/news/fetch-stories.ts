import type { CompanyStory, StorySourceStats } from "@/types/domain";
import { fetchBbcStories } from "./sources/bbc";
import { fetchGdeltStories } from "./sources/gdelt";
import { fetchGoogleNewsStories } from "./sources/google-news";
import { fetchHackerNewsStories } from "./sources/hackernews";
import { fetchNprStories } from "./sources/npr";
import { fetchRedditStories } from "./sources/reddit";
import { fetchSecStories } from "./sources/sec";
import {
  getStoryCache,
  isStoryCacheFresh,
  setStoryCache,
  type StoryCacheEntry,
} from "./story-cache";
import { mergeStories } from "./rss-utils";

export const STORY_SOURCE_NAMES = [
  "google-news",
  "reddit",
  "gdelt",
  "hackernews",
  "bbc",
  "sec",
  "npr",
] as const;

const SOURCE_FETCHERS: Array<{
  name: (typeof STORY_SOURCE_NAMES)[number];
  fetch: (companyName: string) => Promise<CompanyStory[]>;
}> = [
  { name: "google-news", fetch: fetchGoogleNewsStories },
  { name: "reddit", fetch: fetchRedditStories },
  { name: "gdelt", fetch: fetchGdeltStories },
  { name: "hackernews", fetch: fetchHackerNewsStories },
  { name: "bbc", fetch: fetchBbcStories },
  { name: "sec", fetch: fetchSecStories },
  { name: "npr", fetch: fetchNprStories },
];

export type FetchStoriesOptions = {
  companyId: string;
  companyName: string;
  forceRefresh?: boolean;
};

export type FetchStoriesResult = {
  stories: CompanyStory[];
  fetchedAt: string;
  fromCache: boolean;
  sourcesQueried: string[];
  sourceStats: StorySourceStats;
};

function countBySource(stories: CompanyStory[]): StorySourceStats {
  const stats: StorySourceStats = {};
  for (const s of stories) {
    stats[s.source] = (stats[s.source] ?? 0) + 1;
  }
  return stats;
}

export async function fetchCompanyStories(
  options: FetchStoriesOptions
): Promise<FetchStoriesResult> {
  const { companyId, companyName, forceRefresh } = options;
  const cached = getStoryCache(companyId);
  if (!forceRefresh && cached && isStoryCacheFresh(cached)) {
    return {
      stories: cached.stories,
      fetchedAt: cached.fetchedAt,
      fromCache: true,
      sourcesQueried: cached.sourcesQueried,
      sourceStats: countBySource(cached.stories),
    };
  }

  const results = await Promise.allSettled(
    SOURCE_FETCHERS.map((s) => s.fetch(companyName))
  );

  const sourceStats: StorySourceStats = {};
  SOURCE_FETCHERS.forEach((s, i) => {
    const r = results[i];
    sourceStats[s.name] = r.status === "fulfilled" ? r.value.length : 0;
  });

  const stories = mergeStories(
    results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
  ).slice(0, 30);

  const entry = setStoryCache(companyId, stories, [...STORY_SOURCE_NAMES]);
  return {
    stories: entry.stories,
    fetchedAt: entry.fetchedAt,
    fromCache: false,
    sourcesQueried: entry.sourcesQueried,
    sourceStats,
  };
}

/** Back-compat for server pages without company id. */
export async function getCompanyStories(companyName: string): Promise<CompanyStory[]> {
  const result = await fetchCompanyStories({
    companyId: `name:${companyName.toLowerCase()}`,
    companyName,
    forceRefresh: false,
  });
  return result.stories;
}

export function getCachedStoriesForCompany(companyId: string): StoryCacheEntry | undefined {
  return getStoryCache(companyId);
}

import type { CompanyStory } from "@/types/domain";
import { STORY_FETCH_TIMEOUT_MS, STORY_MAX_AGE_MS } from "../constants";
import { hashKey } from "../rss-utils";

type HnHit = {
  title?: string | null;
  url?: string | null;
  objectID?: string;
  created_at_i?: number;
  story_text?: string | null;
};

export async function fetchHackerNewsStories(companyName: string): Promise<CompanyStory[]> {
  const since = Math.floor((Date.now() - STORY_MAX_AGE_MS) / 1000);
  const query = encodeURIComponent(companyName);
  const url = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&numericFilters=created_at_i>${since}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(STORY_FETCH_TIMEOUT_MS),
      next: { revalidate: false },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { hits?: HnHit[] };
    return (json.hits ?? []).flatMap((hit) => {
      const title = hit.title?.trim();
      if (!title) return [];
      const articleUrl =
        hit.url?.trim() ||
        `https://news.ycombinator.com/item?id=${hit.objectID ?? ""}`;
      const publishedAt = hit.created_at_i
        ? new Date(hit.created_at_i * 1000).toISOString()
        : null;
      if (!publishedAt) return [];
      return [
        {
          id: hashKey(`hn:${hit.objectID ?? title}`),
          title,
          url: articleUrl,
          source: "hackernews" as const,
          summary: hit.story_text?.slice(0, 240) ?? title,
          publishedAt,
        },
      ];
    });
  } catch {
    return [];
  }
}

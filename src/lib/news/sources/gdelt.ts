import type { CompanyStory } from "@/types/domain";
import { STORY_FETCH_TIMEOUT_MS, STORY_MAX_AGE_MS } from "../constants";
import { hashKey } from "../rss-utils";

export async function fetchGdeltStories(companyName: string): Promise<CompanyStory[]> {
  const query = encodeURIComponent(
    `"${companyName}" (supply chain OR semiconductor OR logistics OR factory OR sanctions)`
  );
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=20&format=json`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(STORY_FETCH_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      next: { revalidate: false },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      articles?: Array<{
        title?: string;
        url?: string;
        seendate?: string;
        socialimage?: string;
      }>;
    };
    const now = Date.now();
    const articles = json.articles ?? [];

    return articles.flatMap((a) => {
      const title = a.title?.trim();
      const articleUrl = a.url?.trim();
      if (!title || !articleUrl) return [];
      const publishedAt = parseGdeltDate(a.seendate);
      if (!publishedAt || now - new Date(publishedAt).getTime() > STORY_MAX_AGE_MS) return [];
      return [
        {
          id: hashKey(`gdelt:${title}:${articleUrl}`),
          title,
          url: articleUrl,
          source: "gdelt" as const,
          summary: title,
          publishedAt,
        },
      ];
    });
  } catch {
    return [];
  }
}

function parseGdeltDate(seendate?: string): string | null {
  if (!seendate) return null;
  const normalized = seendate.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

import type { CompanyStory } from "@/types/domain";
import { STORY_FETCH_TIMEOUT_MS, STORY_USER_AGENT } from "../constants";
import { parseRssToStories } from "../rss-utils";

export async function fetchRedditStories(companyName: string): Promise<CompanyStory[]> {
  const redditTerms = encodeURIComponent(
    `${companyName} supply chain (title:${companyName} OR selftext:${companyName})`
  );
  const url = `https://www.reddit.com/search.rss?q=${redditTerms}&sort=new&t=day`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(STORY_FETCH_TIMEOUT_MS),
    headers: { "User-Agent": STORY_USER_AGENT },
    next: { revalidate: false },
  });
  const xml = res.ok ? await res.text() : "";
  return parseRssToStories(xml, "reddit");
}

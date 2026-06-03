import type { CompanyStory } from "@/types/domain";
import { STORY_FETCH_TIMEOUT_MS, STORY_USER_AGENT } from "../constants";
import { parseRssToStories } from "../rss-utils";

async function fetchRss(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(STORY_FETCH_TIMEOUT_MS),
    headers: { "User-Agent": STORY_USER_AGENT },
    next: { revalidate: false },
  });
  return res.ok ? res.text() : "";
}

export async function fetchGoogleNewsStories(companyName: string): Promise<CompanyStory[]> {
  const riskTerms = encodeURIComponent(
    `${companyName} supply chain disruption logistics shortage recall sanctions`
  );
  const socialTerms = encodeURIComponent(
    `${companyName} twitter thread supply chain semiconductor`
  );

  const [newsXml, socialXml] = await Promise.all([
    fetchRss(
      `https://news.google.com/rss/search?q=${riskTerms}&hl=en-US&gl=US&ceid=US:en`
    ),
    fetchRss(
      `https://news.google.com/rss/search?q=${socialTerms}&hl=en-US&gl=US&ceid=US:en`
    ),
  ]);

  return [
    ...parseRssToStories(newsXml, "news"),
    ...parseRssToStories(socialXml, "social"),
  ];
}

import type { CompanyStory } from "@/types/domain";
import { STORY_FETCH_TIMEOUT_MS, STORY_USER_AGENT } from "../constants";
import { parseRssToStories } from "../rss-utils";

const NPR_BUSINESS_RSS = "https://feeds.npr.org/1007/rss.xml";

export async function fetchNprStories(companyName: string): Promise<CompanyStory[]> {
  const res = await fetch(NPR_BUSINESS_RSS, {
    signal: AbortSignal.timeout(STORY_FETCH_TIMEOUT_MS),
    headers: { "User-Agent": STORY_USER_AGENT },
    next: { revalidate: false },
  });
  const xml = res.ok ? await res.text() : "";
  return parseRssToStories(xml, "npr", { titleIncludes: companyName });
}

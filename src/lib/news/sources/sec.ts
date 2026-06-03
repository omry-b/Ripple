import type { CompanyStory } from "@/types/domain";
import { STORY_FETCH_TIMEOUT_MS, STORY_MAX_AGE_MS, STORY_USER_AGENT } from "../constants";
import { hashKey, stripTags, xmlDecode } from "../rss-utils";

function parseAtomEntries(xml: string): CompanyStory[] {
  const now = Date.now();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];
  return entries.flatMap((m) => {
    const block = m[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const updatedMatch = block.match(/<updated>([\s\S]*?)<\/updated>/i);
    const linkMatch =
      block.match(/<link[^>]+href="([^"]+)"/i) ||
      block.match(/<link>([\s\S]*?)<\/link>/i);
    const title = titleMatch ? xmlDecode(stripTags(titleMatch[1])) : null;
    const url = linkMatch ? xmlDecode(linkMatch[1].trim()) : null;
    const publishedAt = updatedMatch ? new Date(xmlDecode(updatedMatch[1])).toISOString() : null;
    if (!title || !url || !publishedAt || Number.isNaN(Date.parse(publishedAt))) return [];
    if (now - new Date(publishedAt).getTime() > STORY_MAX_AGE_MS) return [];
    return [
      {
        id: hashKey(`sec:${title}:${url}`),
        title,
        url,
        source: "sec" as const,
        summary: title,
        publishedAt,
      },
    ];
  });
}

/** SEC EDGAR company atom feed (US issuers). */
export async function fetchSecStories(companyName: string): Promise<CompanyStory[]> {
  const firstWord = companyName.split(/\s+/)[0] ?? companyName;
  const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(firstWord)}&owner=exclude&count=15&output=atom`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(STORY_FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": STORY_USER_AGENT,
        Accept: "application/atom+xml, application/xml, text/xml",
      },
      next: { revalidate: false },
    });
    const xml = res.ok ? await res.text() : "";
    return parseAtomEntries(xml);
  } catch {
    return [];
  }
}

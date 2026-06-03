import type { CompanyStory } from "@/types/domain";
import { STORY_MAX_AGE_MS } from "./constants";

export function xmlDecode(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function hashKey(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `story_${Math.abs(hash)}`;
}

function parseRssItems(xml: string): string[] {
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return matches.map((m) => m[1]);
}

function readTag(item: string, tag: string): string | null {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? xmlDecode(match[1].trim()) : null;
}

function toDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function withinStoryWindow(publishedAt: string, nowMs: number): boolean {
  return nowMs - new Date(publishedAt).getTime() <= STORY_MAX_AGE_MS;
}

export function parseRssToStories(
  xml: string,
  source: CompanyStory["source"],
  options?: { titleIncludes?: string }
): CompanyStory[] {
  if (!xml.trim()) return [];
  const now = Date.now();
  const needle = options?.titleIncludes?.toLowerCase();

  return parseRssItems(xml)
    .flatMap((item) => {
      const title = readTag(item, "title");
      const url = readTag(item, "link");
      const summary = stripTags(readTag(item, "description") ?? "");
      const publishedAt = toDate(readTag(item, "pubDate"));
      if (!title || !url || !publishedAt) return [];
      if (needle && !title.toLowerCase().includes(needle)) return [];
      if (!withinStoryWindow(publishedAt, now)) return [];
      return [
        {
          id: hashKey(`${source}:${title}:${url}`),
          title,
          url,
          source,
          summary,
          publishedAt,
        },
      ];
    });
}

export function mergeStories(stories: CompanyStory[]): CompanyStory[] {
  const deduped = new Map<string, CompanyStory>();
  for (const story of stories) {
    if (!deduped.has(story.url)) deduped.set(story.url, story);
  }
  return [...deduped.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

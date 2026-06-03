import { describe, expect, it } from "vitest";
import { mergeStories, parseRssToStories } from "@/lib/news/rss-utils";

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss><channel>
<item>
  <title>Acme Corp supply chain delay</title>
  <link>https://example.com/a</link>
  <description><p>Shortage at port</p></description>
  <pubDate>${new Date().toUTCString()}</pubDate>
</item>
</channel></rss>`;

describe("parseRssToStories", () => {
  it("parses recent RSS items", () => {
    const stories = parseRssToStories(SAMPLE_RSS, "news");
    expect(stories).toHaveLength(1);
    expect(stories[0].title).toContain("Acme");
    expect(stories[0].source).toBe("news");
  });

  it("filters by titleIncludes", () => {
    const stories = parseRssToStories(SAMPLE_RSS, "bbc", { titleIncludes: "Other" });
    expect(stories).toHaveLength(0);
  });
});

describe("mergeStories", () => {
  it("dedupes by url", () => {
    const merged = mergeStories([
      {
        id: "1",
        title: "A",
        url: "https://x.com/1",
        source: "news",
        publishedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "A copy",
        url: "https://x.com/1",
        source: "gdelt",
        publishedAt: new Date().toISOString(),
      },
    ]);
    expect(merged).toHaveLength(1);
  });
});

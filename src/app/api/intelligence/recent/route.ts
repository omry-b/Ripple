import { headers } from "next/headers";
import type { IntelligenceFeedItem } from "@/types/domain";
import { getScopedCompanies } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData, jsonError } from "@/lib/api/response";
import {
  fetchCompanyStories,
  getCachedStoriesForCompany,
} from "@/lib/news/fetch-stories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";
    const limit = Math.min(50, Math.max(5, Number(url.searchParams.get("limit")) || 24));

    const h = await headers();
    const scopedRequest = new Request("http://internal/intelligence", { headers: h });
    const companies = await getScopedCompanies(scopedRequest);

    const watchlistParam = url.searchParams.get("watchlist");
    const watchlistIds = watchlistParam
      ? watchlistParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const top =
      watchlistIds.length > 0
        ? companies.filter((c) => watchlistIds.includes(c.id))
        : [...companies].sort((a, b) => b.score - a.score).slice(0, 8);

    const items: IntelligenceFeedItem[] = [];

    for (const company of top) {
      let stories;
      if (forceRefresh) {
        const result = await fetchCompanyStories({
          companyId: company.id,
          companyName: company.name,
          forceRefresh: true,
        });
        stories = result.stories;
      } else {
        const cached = getCachedStoriesForCompany(company.id);
        if (cached?.stories.length) {
          stories = cached.stories;
        } else {
          const result = await fetchCompanyStories({
            companyId: company.id,
            companyName: company.name,
            forceRefresh: false,
          });
          stories = result.stories;
        }
      }

      for (const story of stories.slice(0, 4)) {
        items.push({
          companyId: company.id,
          companyName: company.name,
          story,
        });
      }
    }

    items.sort(
      (a, b) =>
        new Date(b.story.publishedAt).getTime() -
        new Date(a.story.publishedAt).getTime()
    );

    return jsonData(
      {
        items: items.slice(0, limit),
        companyCount: top.length,
        windowHours: 24,
        asOf: new Date().toISOString(),
      },
      200,
      dataApiCacheHeaders()
    );
  } catch {
    return jsonError("Failed to load intelligence feed", 500);
  }
}

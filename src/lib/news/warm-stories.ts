import { getCompanies } from "@/lib/api";
import { fetchCompanyStories } from "./fetch-stories";

const DEFAULT_WARM_LIMIT = 12;

/** Pre-fetch stories for highest-risk companies (cron / admin). */
export async function warmStoriesForTopCompanies(limit = DEFAULT_WARM_LIMIT): Promise<{
  warmed: number;
  companies: string[];
  errors: string[];
}> {
  const companies = await getCompanies();
  const top = [...companies]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const errors: string[] = [];
  let warmed = 0;

  for (const company of top) {
    try {
      await fetchCompanyStories({
        companyId: company.id,
        companyName: company.name,
        forceRefresh: true,
      });
      warmed += 1;
    } catch (e) {
      errors.push(
        `${company.name}: ${e instanceof Error ? e.message : "fetch failed"}`
      );
    }
  }

  return {
    warmed,
    companies: top.map((c) => c.name),
    errors,
  };
}

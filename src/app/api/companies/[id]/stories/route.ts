import { getSessionUser } from "@/lib/auth/session";
import { getScopedCompanies } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData, jsonError } from "@/lib/api/response";
import { fetchCompanyStories } from "@/lib/news/fetch-stories";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "1";

    const companies = await getScopedCompanies(request);
    const company = companies.find((c) => c.id === id);
    if (!company) {
      return jsonError("Company not found", 404);
    }

    const result = await fetchCompanyStories({
      companyId: id,
      companyName: company.name,
      forceRefresh,
    });

    return jsonData(
      {
        companyId: id,
        companyName: company.name,
        stories: result.stories,
        fetchedAt: result.fetchedAt,
        fromCache: result.fromCache,
        sourcesQueried: result.sourcesQueried,
        sourceStats: result.sourceStats,
        windowHours: 24,
      },
      200,
      dataApiCacheHeaders()
    );
  } catch {
    return jsonError("Failed to load company stories", 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser(request);
  if (user.role === "viewer") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await params;
  const companies = await getScopedCompanies(request);
  const company = companies.find((c) => c.id === id);
  if (!company) {
    return jsonError("Company not found", 404);
  }

  const result = await fetchCompanyStories({
    companyId: id,
    companyName: company.name,
    forceRefresh: true,
  });

  return jsonData({
    companyId: id,
    companyName: company.name,
    stories: result.stories,
    fetchedAt: result.fetchedAt,
    fromCache: false,
    sourcesQueried: result.sourcesQueried,
    sourceStats: result.sourceStats,
    refreshedBy: user.id,
    windowHours: 24,
  });
}

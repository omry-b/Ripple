import { getSearchIndex } from "@/lib/api";
import { getOrgId } from "@/lib/api/scoped";
import { filterIdsForOrg } from "@/lib/org/scope";
import { jsonError, jsonOk } from "@/lib/api/response";
import { NAV_ITEMS } from "@/lib/nav";
import { fullTextSearch, type SearchableItem } from "@/lib/search/full-text";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const orgId = await getOrgId(request);
    const index = await getSearchIndex();
    const companies = filterIdsForOrg(
      index.companies.map((c) => ({ ...c, id: c.id })),
      orgId
    );
    const alerts = filterIdsForOrg(
      index.alerts.map((a) => ({ ...a, id: a.id })),
      orgId
    );
    const navigation = NAV_ITEMS.map((item) => ({
      id: item.href,
      label: item.label,
      sublabel: "Navigate",
      href: item.href,
      group: "Navigate" as const,
      searchText: item.label,
    }));

    const methodology = {
      id: "methodology",
      label: "Risk methodology",
      sublabel: "How scores are computed",
      href: "/methodology",
      group: "Navigate" as const,
      searchText: "methodology scoring weights CVaR signals",
    };

    const systemStatus = {
      id: "system",
      label: "System status",
      sublabel: "Postgres, Cloudflare crons, ingest",
      href: "/settings/system",
      group: "Navigate" as const,
      searchText: "ops health database cloudflare worker cron deploy",
    };

    const all: SearchableItem[] = [
      ...navigation,
      methodology,
      systemStatus,
      ...companies.map((c) => ({
        ...c,
        searchText: `${c.label} ${c.id} ${c.sublabel ?? ""}`,
      })),
      ...alerts.map((a) => ({ ...a, searchText: a.sublabel })),
      ...index.signals.map((s) => ({ ...s, searchText: s.sublabel })),
    ];

    const items = q ? fullTextSearch(all, q) : all;

    return jsonOk({ query: q || null, count: items.length, items });
  } catch {
    return jsonError("Search failed", 500);
  }
}

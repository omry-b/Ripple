import type { Alert, Company } from "@/types/domain";
import type { GeoRegion } from "@/types/domain";

export type CompanySortKey = "score" | "name" | "cvar" | "delta";

export const COMPANY_SORT_KEYS: CompanySortKey[] = ["score", "name", "cvar", "delta"];

export function parseDelta7d(delta: string): number {
  const n = parseFloat(delta.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function sortCompanies(list: Company[], sort: CompanySortKey): Company[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "cvar":
        return b.cvarUsd - a.cvarUsd;
      case "delta":
        return parseDelta7d(b.delta7d) - parseDelta7d(a.delta7d);
      case "score":
      default:
        return b.score - a.score;
    }
  });
}

export type CompanyFilterInput = {
  companies: Company[];
  search: string;
  sort: CompanySortKey;
  tier: string;
  scoreMin: number;
  scoreMax: number;
  alertFilter: Alert | null;
  watchlistOnly: boolean;
  watchlistIds: Set<string>;
  regionFilter: string | null;
  regions: readonly GeoRegion[];
};

export function filterCompanies(input: CompanyFilterInput): Company[] {
  let list = input.companies;

  if (input.watchlistOnly) {
    list = list.filter((c) => input.watchlistIds.has(c.id));
  }

  if (input.alertFilter) {
    list = list.filter((c) => input.alertFilter!.affectedCompanyIds.includes(c.id));
  }

  if (input.regionFilter && input.regions.includes(input.regionFilter as GeoRegion)) {
    list = list.filter((c) => c.region === input.regionFilter);
  }

  if (input.tier !== "all") {
    list = list.filter((c) => c.tier === input.tier);
  }

  list = list.filter((c) => c.score >= input.scoreMin && c.score <= input.scoreMax);

  const q = input.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.tier.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }

  return sortCompanies(list, input.sort);
}

export function parseSortKey(raw: string | null): CompanySortKey {
  if (raw && COMPANY_SORT_KEYS.includes(raw as CompanySortKey)) {
    return raw as CompanySortKey;
  }
  return "score";
}

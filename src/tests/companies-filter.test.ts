import { describe, expect, it } from "vitest";
import type { Company } from "@/types/domain";
import {
  filterCompanies,
  parseDelta7d,
  parseSortKey,
  sortCompanies,
} from "@/lib/companies/filter";

const base = (overrides: Partial<Company>): Company =>
  ({
    id: "c1",
    name: "Alpha Corp",
    score: 80,
    cvarUsd: 1.2,
    delta7d: "+3.0",
    tier: "Tier 1",
    region: "APAC",
    cvar: "$1.2B",
    ...overrides,
  }) as Company;

describe("parseDelta7d", () => {
  it("parses signed deltas", () => {
    expect(parseDelta7d("+3.0")).toBe(3);
    expect(parseDelta7d("-1.5")).toBe(-1.5);
    expect(parseDelta7d("n/a")).toBe(0);
  });
});

describe("sortCompanies", () => {
  const list = [
    base({ id: "a", name: "Zeta", score: 50, delta7d: "+1", cvarUsd: 0.5 }),
    base({ id: "b", name: "Alpha", score: 90, delta7d: "+5", cvarUsd: 2 }),
  ];

  it("sorts by delta7d", () => {
    const sorted = sortCompanies(list, "delta");
    expect(sorted[0].id).toBe("b");
  });

  it("sorts by name", () => {
    const sorted = sortCompanies(list, "name");
    expect(sorted[0].name).toBe("Alpha");
  });
});

describe("filterCompanies", () => {
  const companies = [
    base({ id: "1", name: "Apple Inc", region: "AMER", score: 70 }),
    base({ id: "2", name: "SupplyCo", region: "APAC", score: 40 }),
  ];

  it("filters by search and region", () => {
    const result = filterCompanies({
      companies,
      search: "apple",
      sort: "score",
      tier: "all",
      scoreMin: 0,
      scoreMax: 100,
      alertFilter: null,
      watchlistOnly: false,
      watchlistIds: new Set(),
      regionFilter: "AMER",
      regions: ["APAC", "EMEA", "AMER"],
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Apple Inc");
  });
});

describe("parseSortKey", () => {
  it("defaults invalid keys to score", () => {
    expect(parseSortKey("bogus")).toBe("score");
    expect(parseSortKey("delta")).toBe("delta");
  });
});

import { describe, expect, it } from "vitest";
import { getScoreFactorsForCompany } from "@/lib/mock/score-factors";
import type { Company, GeoRegion } from "@/types/domain";

function company(id: string, opts: Partial<Company> = {}): Company {
  return {
    id,
    name: id,
    region: "APAC",
    score: 60,
    tier: "Tier 1",
    cvar: "",
    cvarUsd: 1e9,
    delta7d: "+1",
    deltaTrend: "bad",
    contagionHops: 2,
    scoreLevel: "elevated",
    history30d: [60],
    ...opts,
  };
}

function topFactor(c: Company): string {
  return getScoreFactorsForCompany(c).reduce((a, b) => (b.contribution > a.contribution ? b : a)).key;
}

describe("dynamic score factors", () => {
  it("returns 5 factors whose weights sum to ~100", () => {
    const factors = getScoreFactorsForCompany(company("sk-hynix"));
    expect(factors).toHaveLength(5);
    const total = factors.reduce((s, f) => s + f.weight, 0);
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });

  it("is deterministic", () => {
    const a = getScoreFactorsForCompany(company("infineon", { region: "EMEA" }));
    const b = getScoreFactorsForCompany(company("infineon", { region: "EMEA" }));
    expect(a).toEqual(b);
  });

  it("produces distinct breakdowns for different companies (not a flat default)", () => {
    const a = getScoreFactorsForCompany(company("bosch", { region: "EMEA", tier: "Tier 1" }));
    const b = getScoreFactorsForCompany(company("micron", { region: "AMER", tier: "Tier 2" }));
    expect(a.map((f) => f.weight)).not.toEqual(b.map((f) => f.weight));
    // Not uniform (the old [1,1,1,1,1] default gave ~equal weights).
    const weights = a.map((f) => f.weight);
    expect(Math.max(...weights) - Math.min(...weights)).toBeGreaterThan(5);
  });

  it("skews logistics names toward shipping", () => {
    expect(topFactor(company("maersk", { region: "EMEA" }))).toBe("logistics");
  });

  it("skews APAC high-risk names toward geopolitical", () => {
    const top = topFactor(company("tsmc", { region: "APAC", score: 80, tier: "Tier 2" }));
    expect(["geo", "concentration"]).toContain(top);
  });

  it("gives lower-scoring names more financial weight than high-scoring peers", () => {
    const base = (region: GeoRegion, score: number) =>
      getScoreFactorsForCompany(company("acme-x", { region, score, tier: "Tier 2" })).find(
        (f) => f.key === "financial"
      )!.weight;
    expect(base("EMEA", 30)).toBeGreaterThan(base("EMEA", 90));
  });
});

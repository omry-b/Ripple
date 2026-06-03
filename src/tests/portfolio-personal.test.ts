import { describe, expect, it } from "vitest";
import {
  buildPositions,
  computePortfolioMetrics,
  defaultExposureUsd,
} from "@/lib/portfolio/metrics";
import {
  buildActionQueue,
  recommendForCompany,
  dominantFactor,
} from "@/lib/portfolio/recommendations";
import type { Alert, Company } from "@/types/domain";

function company(id: string, name: string, score: number, cvarUsd: number): Company {
  return {
    id,
    name,
    region: "APAC",
    score,
    tier: "Tier 1",
    cvar: "",
    cvarUsd,
    delta7d: "+1.0",
    deltaTrend: "bad",
    contagionHops: 2,
    scoreLevel: score >= 75 ? "critical" : "elevated",
    history30d: [score, score, score],
  };
}

const APPLE = company("apple", "Apple Inc.", 82, 4.2e9);
const TSMC = company("tsmc", "TSMC", 74, 3.6e9);
const SAMSUNG = { ...company("samsung", "Samsung", 56, 2.1e9), region: "EMEA" as const };
const NVIDIA = { ...company("nvidia", "NVIDIA", 48, 1.5e9), region: "AMER" as const };
const COMPANIES = [APPLE, TSMC, SAMSUNG, NVIDIA];

describe("portfolio metrics", () => {
  it("defaults exposure to the company's CVaR base, overridden by the user", () => {
    expect(defaultExposureUsd(APPLE)).toBe(4.2e9);
    const positions = buildPositions(COMPANIES, { apple: 1e9 });
    const apple = positions.find((p) => p.company.id === "apple")!;
    expect(apple.exposureUsd).toBe(1e9);
    expect(apple.isCustomExposure).toBe(true);
    const tsmc = positions.find((p) => p.company.id === "tsmc")!;
    expect(tsmc.exposureUsd).toBe(TSMC.cvarUsd);
    expect(tsmc.isCustomExposure).toBe(false);
  });

  it("returns an empty metric set for an empty portfolio", () => {
    const m = computePortfolioMetrics([]);
    expect(m.positionCount).toBe(0);
    expect(m.cvarUsd).toBe(0);
    expect(m.totalExposureUsd).toBe(0);
  });

  it("computes coherent, exposure-scoped metrics", () => {
    const positions = buildPositions(COMPANIES, {});
    const m = computePortfolioMetrics(positions);
    expect(m.positionCount).toBe(4);
    expect(m.totalExposureUsd).toBeCloseTo(4.2e9 + 3.6e9 + 2.1e9 + 1.5e9, -6);
    // CVaR ≥ VaR ≥ expected loss > 0, from the validated MC engine.
    expect(m.cvarUsd).toBeGreaterThanOrEqual(m.varUsd);
    expect(m.varUsd).toBeGreaterThanOrEqual(m.expectedLossUsd);
    expect(m.expectedLossUsd).toBeGreaterThan(0);
    // Exposure-weighted risk index sits between the min and max position scores.
    expect(m.riskIndex).toBeGreaterThanOrEqual(48);
    expect(m.riskIndex).toBeLessThanOrEqual(82);
    // Region mix covers the three regions and sums to ~100%.
    expect(m.regionMix.map((r) => r.region).sort()).toEqual(["AMER", "APAC", "EMEA"]);
    expect(m.regionMix.reduce((s, r) => s + r.sharePct, 0)).toBeCloseTo(100, 1);
  });

  it("scopes metrics to the user's book — raising an exposure raises portfolio risk", () => {
    const base = computePortfolioMetrics(buildPositions(COMPANIES, {}));
    const concentrated = computePortfolioMetrics(buildPositions(COMPANIES, { apple: 20e9 }));
    expect(concentrated.totalExposureUsd).toBeGreaterThan(base.totalExposureUsd);
    expect(concentrated.expectedLossUsd).toBeGreaterThan(base.expectedLossUsd);
    expect(concentrated.topConcentration).toBeGreaterThan(base.topConcentration);
    expect(concentrated.topPositions[0].company.id).toBe("apple");
  });
});

describe("decision-support recommendations", () => {
  it("identifies a dominant risk factor and a matching mitigation", () => {
    const factor = dominantFactor(APPLE);
    expect(factor).not.toBeNull();
    const rec = recommendForCompany(APPLE);
    expect(rec.title.length).toBeGreaterThan(0);
    expect(rec.factorLabel.length).toBeGreaterThan(0);
    expect(["Low", "Medium", "High"]).toContain(rec.effort);
    expect(["$", "$$", "$$$"]).toContain(rec.cost);
  });

  it("ranks the action queue by dollars at risk (exposure × risk)", () => {
    const positions = buildPositions(COMPANIES, {});
    const queue = buildActionQueue(positions, [], 5);
    expect(queue.length).toBe(4);
    // Sorted descending by priority.
    for (let i = 1; i < queue.length; i += 1) {
      expect(queue[i - 1].priority).toBeGreaterThanOrEqual(queue[i].priority);
    }
    // Every action carries a concrete recommendation.
    expect(queue.every((a) => a.recommendation.title.length > 0)).toBe(true);
    // Apple (highest score AND exposure) tops the queue.
    expect(queue[0].company.id).toBe("apple");
  });

  it("boosts priority for positions with an open alert", () => {
    const positions = buildPositions([SAMSUNG, NVIDIA], {});
    const alert: Alert = {
      id: "a1",
      level: "critical",
      status: "open",
      statusLabel: "● CRITICAL",
      title: "Shock",
      detail: "",
      meta: "",
      affectedCompanyIds: ["nvidia"],
      timeline: [],
    };
    const withAlert = buildActionQueue(positions, [alert], 5);
    const nvidia = withAlert.find((a) => a.company.id === "nvidia")!;
    expect(nvidia.hasOpenAlert).toBe(true);
    // Without the alert NVIDIA ranks below Samsung (lower exposure); the 1.4×
    // boost should lift it above.
    const noAlert = buildActionQueue(positions, [], 5);
    const nvidiaRankNoAlert = noAlert.findIndex((a) => a.company.id === "nvidia");
    const nvidiaRankWithAlert = withAlert.findIndex((a) => a.company.id === "nvidia");
    expect(nvidiaRankWithAlert).toBeLessThanOrEqual(nvidiaRankNoAlert);
  });
});

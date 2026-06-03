import { describe, expect, it } from "vitest";
import { computeScoreAttribution, parseDelta } from "@/lib/risk/attribution";
import { computePeerComparison } from "@/lib/risk/peer-comparison";
import type { Company, ScoreFactor, SignalStream } from "@/types/domain";

function company(id: string, score: number, opts: Partial<Company> = {}): Company {
  return {
    id,
    name: id,
    region: "APAC",
    score,
    tier: "Tier 1",
    cvar: "",
    cvarUsd: 1e9,
    delta7d: "↑ +6",
    deltaTrend: "bad",
    contagionHops: 2,
    scoreLevel: "elevated",
    history30d: [score],
    ...opts,
  };
}

const FACTORS: ScoreFactor[] = [
  { key: "geo", label: "Geopolitical exposure", weight: 32, contribution: 26 },
  { key: "logistics", label: "Logistics & shipping", weight: 24, contribution: 18 },
  { key: "financial", label: "Financial distress", weight: 18, contribution: 10 },
];

const SIGNAL: SignalStream = {
  id: "geo",
  name: "Geopolitical",
  category: "Geopolitical",
  score: 91,
  level: "critical",
  sparkline: "",
  history7d: [80, 85, 91],
  time: "5m",
  description: "",
  relatedCompanyIds: ["apple"],
};

describe("dynamic score attribution", () => {
  it("parses signed deltas from arrow labels", () => {
    expect(parseDelta("↑ +9")).toBe(9);
    expect(parseDelta("↓ -2")).toBe(-2);
    expect(parseDelta("flat")).toBe(3);
  });

  it("attributes the rise to the real dominant factors and top signal", () => {
    const attr = computeScoreAttribution(company("apple", 81), FACTORS, [SIGNAL]);
    expect(attr.direction).toBe("up");
    // Leads with the dominant factor.
    expect(attr.summary.toLowerCase()).toContain("geopolitical");
    // Includes the strongest live signal.
    expect(attr.drivers.some((d) => d.label.includes("Geopolitical signal"))).toBe(true);
    // Points are positive and roughly sum to the delta magnitude (|+6|).
    const total = attr.drivers.reduce((s, d) => s + d.points, 0);
    expect(total).toBeGreaterThanOrEqual(6);
    expect(attr.drivers.every((d) => d.points >= 1)).toBe(true);
  });

  it("reports easing when risk fell over 7d", () => {
    const attr = computeScoreAttribution(
      company("amd", 44, { delta7d: "↓ -3", deltaTrend: "good" }),
      FACTORS,
      []
    );
    expect(attr.direction).toBe("down");
    expect(attr.summary.toLowerCase()).toContain("easing");
  });

  it("works with no signals (fully data-driven, no hardcoding)", () => {
    const attr = computeScoreAttribution(company("nidec", 39), FACTORS, []);
    expect(attr.drivers.length).toBeGreaterThan(0);
    expect(attr.summary.length).toBeGreaterThan(0);
  });
});

describe("dynamic peer comparison", () => {
  const peers = [
    company("a", 40),
    company("b", 50),
    company("c", 60),
    company("d", 70),
  ];

  it("computes median and percentile from the actual peer set", () => {
    const subject = company("x", 65);
    const cmp = computePeerComparison(subject, peers);
    expect(cmp.peerCount).toBe(4);
    expect(cmp.medianScore).toBe(55); // median of 40,50,60,70
    expect(cmp.scoreDelta).toBe(10); // 65 - 55
    // 65 is riskier than 40,50,60 → 3/4 = 75th percentile.
    expect(cmp.scorePercentile).toBe(75);
  });

  it("degrades gracefully with no peers", () => {
    const cmp = computePeerComparison(company("solo", 50), []);
    expect(cmp.peerCount).toBe(0);
    expect(cmp.medianScore).toBe(50);
    expect(cmp.scorePercentile).toBe(50);
  });

  it("moves the percentile as the subject's score changes", () => {
    const low = computePeerComparison(company("x", 35), peers);
    const high = computePeerComparison(company("x", 80), peers);
    expect(high.scorePercentile).toBeGreaterThan(low.scorePercentile);
  });
});

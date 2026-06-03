import { describe, expect, it } from "vitest";
import {
  simulatePortfolioLoss,
  buildScenarioSimulation,
  type Position,
} from "@/lib/risk/monte-carlo-engine";
import type { Company } from "@/types/domain";

const positions: Position[] = [
  { id: "a", name: "A", exposureUsd: 4e9, disruptionProb: 0.25 },
  { id: "b", name: "B", exposureUsd: 3e9, disruptionProb: 0.18 },
  { id: "c", name: "C", exposureUsd: 2e9, disruptionProb: 0.4 },
  { id: "d", name: "D", exposureUsd: 1.5e9, disruptionProb: 0.1 },
  { id: "e", name: "E", exposureUsd: 1e9, disruptionProb: 0.3 },
];

function company(id: string, score: number, cvarUsd: number): Company {
  return {
    id,
    name: id.toUpperCase(),
    region: "APAC",
    score,
    tier: "Tier 1",
    cvar: "",
    cvarUsd,
    delta7d: "",
    deltaTrend: "bad",
    contagionHops: 1,
    scoreLevel: "elevated",
    history30d: [score, score, score],
  };
}

describe("simulatePortfolioLoss", () => {
  it("is deterministic for a fixed seed", () => {
    const a = simulatePortfolioLoss(positions, { seed: "fixed", trials: 4000 });
    const b = simulatePortfolioLoss(positions, { seed: "fixed", trials: 4000 });
    expect(a.cvarUsd).toBe(b.cvarUsd);
    expect(a.varUsd).toBe(b.varUsd);
    expect(a.expectedLossUsd).toBe(b.expectedLossUsd);
    expect(a.histogram).toEqual(b.histogram);
  });

  it("produces a coherent tail ordering CVaR ≥ VaR ≥ E[L] ≥ 0", () => {
    const r = simulatePortfolioLoss(positions, { seed: "coherent", trials: 8000 });
    expect(r.expectedLossUsd).toBeGreaterThanOrEqual(0);
    expect(r.varUsd).toBeGreaterThanOrEqual(r.expectedLossUsd - 1); // tolerance for ties
    expect(r.cvarUsd).toBeGreaterThanOrEqual(r.varUsd);
    expect(r.p99Usd).toBeGreaterThanOrEqual(r.p95Usd);
    expect(r.maxUsd).toBeGreaterThanOrEqual(r.p99Usd);
  });

  it("returns a 12-bin histogram whose counts sum to the trial count", () => {
    const trials = 5000;
    const r = simulatePortfolioLoss(positions, { seed: "hist", trials });
    expect(r.histogram).toHaveLength(12);
    expect(r.histogram.reduce((s, c) => s + c, 0)).toBe(trials);
  });

  it("respects Expected Shortfall sub-additivity (diversification ≤ standalone sum)", () => {
    // With systemic correlation strictly below 1, portfolio CVaR must be no
    // larger than the sum of standalone CVaRs — a defining property of a
    // coherent risk measure.
    const r = simulatePortfolioLoss(positions, {
      seed: "subadd",
      trials: 12000,
      correlation: 0.2,
    });
    expect(r.cvarUsd).toBeLessThanOrEqual(r.sumStandaloneCvarUsd);
    expect(r.diversificationRatio).toBeLessThanOrEqual(1);
    expect(r.diversificationBenefitUsd).toBeGreaterThan(0);
  });

  it("increases tail risk as systemic correlation rises", () => {
    const low = simulatePortfolioLoss(positions, {
      seed: "rho",
      trials: 12000,
      correlation: 0.05,
    });
    const high = simulatePortfolioLoss(positions, {
      seed: "rho",
      trials: 12000,
      correlation: 0.8,
    });
    // Clustering fattens the tail: CVaR and diversification ratio both rise.
    expect(high.cvarUsd).toBeGreaterThan(low.cvarUsd);
    expect(high.diversificationRatio).toBeGreaterThan(low.diversificationRatio);
  });

  it("converges: expected loss is near analytic Σ Eᵢ·pᵢ·μ_LGD", () => {
    const lgdMean = 0.55;
    const r = simulatePortfolioLoss(positions, {
      seed: "converge",
      trials: 40000,
      lgdMean,
      lgdVol: 0.15,
    });
    const analytic = positions.reduce(
      (s, p) => s + p.exposureUsd * p.disruptionProb * lgdMean,
      0
    );
    // E[L] = Σ Eᵢ·pᵢ·E[LGD] regardless of correlation; within ~3% at 40k trials.
    expect(r.expectedLossUsd).toBeGreaterThan(analytic * 0.97);
    expect(r.expectedLossUsd).toBeLessThan(analytic * 1.03);
  });
});

describe("buildScenarioSimulation", () => {
  const portfolio = [
    company("apple", 81, 4e9),
    company("tsmc", 74, 3e9),
    company("samsung", 58, 2e9),
    company("nvidia", 49, 1.5e9),
  ];

  it("maps higher risk scores to higher disruption probabilities (convex)", () => {
    const { positions: pos } = buildScenarioSimulation(portfolio, { severity: 100 });
    const byId = Object.fromEntries(pos.map((p) => [p.id, p.disruptionProb]));
    expect(byId.apple).toBeGreaterThan(byId.tsmc);
    expect(byId.tsmc).toBeGreaterThan(byId.samsung);
    expect(byId.samsung).toBeGreaterThan(byId.nvidia);
  });

  it("scales tail risk monotonically with scenario severity", () => {
    const mild = buildScenarioSimulation(portfolio, { severity: 60, seed: "s" });
    const harsh = buildScenarioSimulation(portfolio, { severity: 140, seed: "s" });
    const mildR = simulatePortfolioLoss(mild.positions, mild.config);
    const harshR = simulatePortfolioLoss(harsh.positions, harsh.config);
    expect(harshR.expectedLossUsd).toBeGreaterThan(mildR.expectedLossUsd);
    expect(harshR.cvarUsd).toBeGreaterThan(mildR.cvarUsd);
  });

  it("raises confidence ⇒ raises CVaR for the same portfolio", () => {
    const base = buildScenarioSimulation(portfolio, { severity: 100, confidence: 95, seed: "c" });
    const tail = buildScenarioSimulation(portfolio, { severity: 100, confidence: 99, seed: "c" });
    const baseR = simulatePortfolioLoss(base.positions, base.config);
    const tailR = simulatePortfolioLoss(tail.positions, tail.config);
    expect(tailR.cvarUsd).toBeGreaterThanOrEqual(baseR.cvarUsd);
  });
});

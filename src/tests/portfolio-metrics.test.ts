import { describe, expect, it } from "vitest";
import {
  computePortfolioCvarBaseline,
  computeRiskIndex,
  scorePortfolioCompanies,
} from "@/lib/risk/portfolio-metrics";
import type { Company, SignalStream } from "@/types/domain";

const company: Company = {
  id: "apple",
  name: "Apple",
  region: "APAC",
  score: 50,
  tier: "Tier 1",
  cvar: "$1.0B",
  cvarUsd: 1e9,
  delta7d: "↑ +2",
  deltaTrend: "bad",
  contagionHops: 2,
  scoreLevel: "elevated",
  history30d: [40, 42, 44, 46, 48, 50, 50],
};

const hotStream: SignalStream = {
  id: "ais",
  name: "AIS",
  category: "Logistics",
  score: 92,
  level: "critical",
  sparkline: "",
  history7d: [50, 60, 70, 80, 85, 90, 92],
  time: "now",
  description: "test",
  relatedCompanyIds: ["apple"],
  methodology: "test",
};

describe("portfolio-metrics", () => {
  it("raises risk index when streams and ingest severity increase", () => {
    const calm = computeRiskIndex([], [], [], [company]);
    const stressed = computeRiskIndex(
      [hotStream],
      [],
      [
        {
          id: "e1",
          adapter: "weather",
          occurredAt: new Date().toISOString(),
          severity: 85,
          summary: "Severe",
          lng: 0,
          lat: 0,
          region: "APAC",
          level: "critical",
        },
      ],
      scorePortfolioCompanies([company], [hotStream])
    );
    expect(stressed).toBeGreaterThan(calm);
  });

  it("moves portfolio CVaR when live scores diverge from history", () => {
    const scored = scorePortfolioCompanies([company], [hotStream]);
    const baseline = computePortfolioCvarBaseline(scored);
    expect(baseline.currentB).not.toBe(baseline.baselineB);
  });
});

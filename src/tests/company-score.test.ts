import { describe, expect, it } from "vitest";
import { computeCompanyScore } from "../lib/risk/company-score";
import { mockStore } from "../lib/mock/store";

describe("computeCompanyScore", () => {
  it("returns confidence band", () => {
    const company = mockStore.getCompanies()[0];
    const signals = mockStore.getSignals();
    const scored = computeCompanyScore(company, signals);
    expect(scored.scoreConfidence.high).toBeGreaterThanOrEqual(scored.score);
    expect(scored.scoreMethod).toContain("signals");
  });
});

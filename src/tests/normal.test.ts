import { describe, expect, it } from "vitest";
import {
  erf,
  normalCdf,
  normalInverseCdf,
  normalPdf,
  expectedShortfallMultiplier,
} from "@/lib/risk/normal";

describe("normal distribution primitives", () => {
  it("erf hits known reference values", () => {
    expect(erf(0)).toBeCloseTo(0, 6);
    expect(erf(1)).toBeCloseTo(0.8427, 3);
    expect(erf(-1)).toBeCloseTo(-0.8427, 3);
    expect(erf(3)).toBeCloseTo(1, 3);
  });

  it("normalCdf matches standard-normal table values", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3);
    expect(normalCdf(1.645)).toBeCloseTo(0.95, 3);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
  });

  it("normalInverseCdf inverts the CDF", () => {
    expect(normalInverseCdf(0.5)).toBeCloseTo(0, 6);
    expect(normalInverseCdf(0.95)).toBeCloseTo(1.645, 2);
    expect(normalInverseCdf(0.975)).toBeCloseTo(1.96, 2);
    expect(normalInverseCdf(0.99)).toBeCloseTo(2.326, 2);
  });

  it("Φ and Φ⁻¹ round-trip", () => {
    for (const x of [-2.5, -1, -0.3, 0.7, 1.4, 2.1]) {
      expect(normalInverseCdf(normalCdf(x))).toBeCloseTo(x, 2);
    }
  });

  it("normalPdf integrates near 1 over a fine grid", () => {
    let area = 0;
    const dx = 0.01;
    for (let x = -8; x <= 8; x += dx) area += normalPdf(x) * dx;
    expect(area).toBeCloseTo(1, 3);
  });

  it("Expected Shortfall multipliers match the textbook normal values", () => {
    // ES_α / σ = φ(Φ⁻¹(α)) / (1−α)
    expect(expectedShortfallMultiplier(0.95)).toBeCloseTo(2.063, 2);
    expect(expectedShortfallMultiplier(0.99)).toBeCloseTo(2.665, 2);
    // ES99 should be ~1.29× ES95 — strictly larger than the old flat 1.18.
    const ratio = expectedShortfallMultiplier(0.99) / expectedShortfallMultiplier(0.95);
    expect(ratio).toBeGreaterThan(1.25);
    expect(ratio).toBeLessThan(1.33);
  });
});

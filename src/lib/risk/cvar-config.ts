import { expectedShortfallMultiplier } from "@/lib/risk/normal";

export type CvarConfidence = 95 | 99;

/**
 * Confidence multiplier applied to the 95%-anchored CVaR base.
 *
 * Per-company `cvarUsd` is already calibrated as a CVaR₉₅ figure, so 95% maps to
 * 1.0. The 99% level uses the *true* normal Expected Shortfall ratio
 * ES₉₉ / ES₉₅ = φ(Φ⁻¹(.99))/.01 ÷ φ(Φ⁻¹(.95))/.05 ≈ 1.29 — the textbook tail
 * relationship (the previous flat 1.18 understated the 99% tail).
 */
export function getCvarMultiplier(level: CvarConfidence = 95): number {
  if (level === 95) return 1;
  return expectedShortfallMultiplier(level) / expectedShortfallMultiplier(95);
}

export function formatCvarLevel(level: CvarConfidence): string {
  return `CVaR${level === 99 ? "₉₉" : "₉₅"}`;
}

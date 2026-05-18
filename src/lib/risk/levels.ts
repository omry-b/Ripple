import type { RiskLevel } from "@/types/domain";

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "elevated";
  return "normal";
}

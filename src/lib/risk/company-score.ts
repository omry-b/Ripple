import type { Company, SignalStream } from "@/types/domain";
import { getCategoryWeight } from "@/lib/risk/weights";

export type ScoredCompany = Company & {
  scoreConfidence: { low: number; high: number };
  scoreMethod: string;
};

export function computeCompanyScore(
  company: Company,
  signals: SignalStream[]
): ScoredCompany {
  const related = signals.filter((s) => s.relatedCompanyIds.includes(company.id));
  const tierBoost = company.tier === "Tier 1" ? 4 : 0;
  const concentrationBoost = company.contagionHops >= 3 ? 6 : company.contagionHops * 2;

  let weighted = company.score;
  if (related.length > 0) {
    const sum = related.reduce(
      (acc, s) => acc + s.score * getCategoryWeight(s.category),
      0
    );
    const weightTotal = related.reduce((acc, s) => acc + getCategoryWeight(s.category), 0);
    const signalAvg = weightTotal > 0 ? sum / weightTotal : company.score;
    weighted = Math.round(company.score * 0.55 + signalAvg * 0.45 + tierBoost + concentrationBoost);
  }

  const margin = Math.max(3, Math.round(weighted * 0.08));

  return {
    ...company,
    score: Math.min(100, weighted),
    scoreConfidence: {
      low: Math.max(0, weighted - margin),
      high: Math.min(100, weighted + margin),
    },
    scoreMethod: `f(signals×category weights, tier, concentration)`,
  };
}

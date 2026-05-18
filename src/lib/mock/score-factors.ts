import type { ScoreFactor } from "@/types/domain";

const FACTOR_TEMPLATES: Omit<ScoreFactor, "contribution">[] = [
  { key: "geo", label: "Geopolitical exposure", weight: 28 },
  { key: "logistics", label: "Logistics & shipping", weight: 24 },
  { key: "financial", label: "Financial distress", weight: 18 },
  { key: "concentration", label: "Supplier concentration", weight: 20 },
  { key: "weather", label: "Weather & climate", weight: 10 },
];

export function getScoreFactorsForCompany(companyId: string, totalScore: number): ScoreFactor[] {
  const skew: Record<string, number[]> = {
    apple: [1.15, 1.05, 0.9, 1.2, 0.85],
    tsmc: [1.25, 1.1, 1.15, 1.05, 0.9],
    foxconn: [1.05, 1.2, 0.95, 1.1, 1.0],
    samsung: [0.95, 1.05, 0.9, 1.0, 1.1],
    qualcomm: [1.1, 0.95, 1.0, 1.15, 0.9],
    nvidia: [1.0, 0.9, 1.05, 1.2, 0.85],
    amd: [0.9, 0.85, 1.1, 1.05, 0.95],
  };

  const multipliers = skew[companyId] ?? [1, 1, 1, 1, 1];
  const weighted = FACTOR_TEMPLATES.map((f, i) => ({
    ...f,
    effective: f.weight * multipliers[i],
  }));
  const sum = weighted.reduce((a, w) => a + w.effective, 0);

  return weighted.map((w) => ({
    key: w.key,
    label: w.label,
    weight: Math.round((w.effective / sum) * 100),
    contribution: Math.round((w.effective / sum) * totalScore),
  }));
}

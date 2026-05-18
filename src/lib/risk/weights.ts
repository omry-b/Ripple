export type SignalCategory =
  | "Logistics"
  | "Geopolitical"
  | "Financial"
  | "Weather"
  | "Other";

export const DEFAULT_CATEGORY_WEIGHTS: Record<SignalCategory, number> = {
  Logistics: 0.28,
  Geopolitical: 0.32,
  Financial: 0.18,
  Weather: 0.12,
  Other: 0.1,
};

export function getCategoryWeight(category: string): number {
  const key = category as SignalCategory;
  return DEFAULT_CATEGORY_WEIGHTS[key] ?? DEFAULT_CATEGORY_WEIGHTS.Other;
}

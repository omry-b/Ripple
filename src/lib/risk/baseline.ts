import type { Company } from "@/types/domain";

/** 30-day rolling baseline vs current portfolio CVaR (placeholder). */
export function computeCvarBaseline(companies: Company[]): {
  baselineB: number;
  currentB: number;
  deltaLabel: string;
  progressPercent: number;
} {
  const currentUsd = companies.reduce((s, c) => s + c.cvarUsd, 0);
  const currentB = currentUsd / 1e9;
  const baselineB = currentB * 0.82;
  const delta = currentB - baselineB;
  const sign = delta >= 0 ? "↑" : "↓";
  return {
    baselineB: Math.round(baselineB * 10) / 10,
    currentB: Math.round(currentB * 10) / 10,
    deltaLabel: `${sign} $${Math.abs(delta).toFixed(1)}B vs 30d baseline`,
    progressPercent: Math.min(100, Math.round((currentB / Math.max(baselineB, 0.1)) * 50)),
  };
}

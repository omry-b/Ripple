import type { Alert, Company, SignalStream } from "@/types/domain";
import type { PersistedIngestEvent } from "@/lib/ingest/sync-risk";
import { computeCompanyScore } from "@/lib/risk/company-score";
import { getCategoryWeight } from "@/lib/risk/weights";
import { getCvarMultiplier, type CvarConfidence } from "@/lib/risk/cvar-config";
import { riskLevelFromScore } from "@/lib/risk/levels";

export function formatCvarUsd(usd: number): string {
  const b = usd / 1e9;
  if (b >= 1) return `$${b.toFixed(1)}B`;
  if (usd >= 1_000_000) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${Math.round(usd / 1000)}K`;
}

/** Live score and tail exposure from current signal readings. */
export function scorePortfolioCompanies(
  companies: Company[],
  streams: SignalStream[]
): Company[] {
  return companies.map((company) => {
    const scored = computeCompanyScore(company, streams);
    const cvarUsd = dynamicCompanyCvarUsd(company, scored.score);
    const level = riskLevelFromScore(scored.score);
    return {
      ...company,
      score: scored.score,
      scoreLevel: level === "normal" ? "elevated" : level,
      cvarUsd,
      cvar: formatCvarUsd(cvarUsd),
    };
  });
}

export function dynamicCompanyCvarUsd(company: Company, liveScore: number): number {
  const hist = company.history30d;
  const histAvg = hist.length
    ? hist.reduce((a, b) => a + b, 0) / hist.length
    : company.score;
  const stress = liveScore / Math.max(histAvg, 1);
  return company.cvarUsd * Math.min(2.2, Math.max(0.65, stress));
}

export function computePortfolioCvar(
  companies: Company[],
  confidence: CvarConfidence = 95
): { totalUsd: number; billions: number; display: string } {
  const mult = getCvarMultiplier(confidence);
  const totalUsd = companies.reduce((sum, c) => sum + c.cvarUsd * mult, 0);
  const billions = totalUsd / 1e9;
  return {
    totalUsd,
    billions: Math.round(billions * 10) / 10,
    display: formatCvarUsd(totalUsd),
  };
}

export function computePortfolioCvarBaseline(companies: Company[]): {
  baselineB: number;
  currentB: number;
  deltaLabel: string;
  progressPercent: number;
} {
  const currentUsd = companies.reduce((s, c) => s + c.cvarUsd, 0);
  const currentB = currentUsd / 1e9;

  const baselineUsd = companies.reduce((s, c) => {
    const hist = c.history30d;
    const histAvg = hist.length
      ? hist.reduce((a, b) => a + b, 0) / hist.length
      : c.score;
    const histStress = histAvg / Math.max(c.score, 1);
    return s + c.cvarUsd / Math.min(2.2, Math.max(0.65, histStress));
  }, 0);
  const baselineB = baselineUsd / 1e9;

  const deltaB = currentB - baselineB;
  const sign = deltaB >= 0 ? "↑" : "↓";
  const deltaLabel =
    Math.abs(deltaB) < 0.05
      ? `Portfolio CVaR in line with 30-day baseline (${baselineB.toFixed(1)}B)`
      : `${sign} $${Math.abs(deltaB).toFixed(1)}B vs 30-day baseline (${baselineB.toFixed(1)}B)`;

  const scale = Math.max(currentB, baselineB, 0.1);
  const progressPercent = Math.min(100, Math.round((currentB / scale) * 100));

  return {
    baselineB: Math.round(baselineB * 10) / 10,
    currentB: Math.round(currentB * 10) / 10,
    deltaLabel,
    progressPercent,
  };
}

export function computeRiskIndex(
  streams: SignalStream[],
  alerts: Alert[],
  ingestEvents: PersistedIngestEvent[],
  companies: Company[]
): number {
  const streamScore =
    streams.length > 0
      ? streams.reduce(
          (sum, s) => sum + s.score * getCategoryWeight(s.category),
          0
        ) / streams.reduce((sum, s) => sum + getCategoryWeight(s.category), 0)
      : 0;

  const liveIngest = ingestEvents.filter((e) => e.level !== "normal");
  const ingestPressure =
    liveIngest.length > 0
      ? liveIngest.reduce((sum, e) => sum + e.severity, 0) / liveIngest.length
      : 0;

  const openAlerts = alerts.filter((a) => a.status === "open");
  const alertPressure = Math.min(
    100,
    openAlerts.reduce(
      (sum, a) => sum + (a.level === "critical" ? 18 : a.level === "elevated" ? 10 : 0),
      0
    )
  );

  const totalCvar = companies.reduce((s, c) => s + c.cvarUsd, 0) || 1;
  const exposureWeighted =
    companies.length > 0
      ? companies.reduce((sum, c) => sum + c.score * (c.cvarUsd / totalCvar), 0)
      : 0;

  const index =
    streamScore * 0.38 +
    ingestPressure * 0.27 +
    alertPressure * 0.12 +
    exposureWeighted * 0.23;

  return Math.round(Math.min(100, Math.max(0, index)) * 10) / 10;
}

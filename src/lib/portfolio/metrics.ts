/**
 * Personalized portfolio risk metrics.
 *
 * Everything here is scoped to the *user's* positions (the companies they hold,
 * with their dollar exposures), not the global demo book. The tail-risk numbers
 * come from the same validated Monte Carlo engine the scenario workbench uses
 * (`simulatePortfolioLoss`), so "my CVaR" and a stress run are consistent.
 */
import type { Company, GeoRegion } from "@/types/domain";
import {
  buildScenarioSimulation,
  simulatePortfolioLoss,
} from "@/lib/risk/monte-carlo-engine";
import type { ExposureMap } from "@/lib/portfolio/storage";

export type PortfolioPosition = {
  company: Company;
  exposureUsd: number;
  isCustomExposure: boolean;
};

export type PortfolioMetrics = {
  positionCount: number;
  totalExposureUsd: number;
  cvarUsd: number;
  varUsd: number;
  expectedLossUsd: number;
  diversificationBenefitUsd: number;
  /** Exposure-weighted average risk score (0–100). */
  riskIndex: number;
  atRiskCount: number;
  criticalCount: number;
  /** Largest single position as a share of total exposure (0–1). */
  topConcentration: number;
  topPositions: PositionShare[];
  regionMix: RegionShare[];
};

export type PositionShare = {
  company: Company;
  exposureUsd: number;
  sharePct: number;
};

export type RegionShare = {
  region: GeoRegion;
  exposureUsd: number;
  sharePct: number;
};

/** Default exposure when a user hasn't set one: the company's modeled CVaR base. */
export function defaultExposureUsd(company: Company): number {
  return company.cvarUsd;
}

/** Build positions from the held companies and the user's exposure overrides. */
export function buildPositions(
  companies: Company[],
  exposures: ExposureMap
): PortfolioPosition[] {
  return companies.map((company) => {
    const override = exposures[company.id];
    const hasOverride = Number.isFinite(override) && override > 0;
    return {
      company,
      exposureUsd: hasOverride ? override : defaultExposureUsd(company),
      isCustomExposure: hasOverride,
    };
  });
}

const EMPTY: PortfolioMetrics = {
  positionCount: 0,
  totalExposureUsd: 0,
  cvarUsd: 0,
  varUsd: 0,
  expectedLossUsd: 0,
  diversificationBenefitUsd: 0,
  riskIndex: 0,
  atRiskCount: 0,
  criticalCount: 0,
  topConcentration: 0,
  topPositions: [],
  regionMix: [],
};

export function computePortfolioMetrics(
  positions: PortfolioPosition[],
  options: { confidence?: 95 | 99; trials?: number } = {}
): PortfolioMetrics {
  if (positions.length === 0) return EMPTY;

  const confidence = options.confidence ?? 95;
  const totalExposureUsd = positions.reduce((s, p) => s + p.exposureUsd, 0);

  // Exposure-weighted average score → a portfolio-level risk index.
  const riskIndex =
    totalExposureUsd > 0
      ? Math.round(
          positions.reduce((s, p) => s + p.company.score * p.exposureUsd, 0) /
            totalExposureUsd
        )
      : 0;

  // Run the validated MC engine over the user's exposures. We rebase each
  // company's exposure (cvarUsd) to the user's dollar amount so the simulation
  // reflects their actual book; the score still drives disruption probability.
  const companiesForSim: Company[] = positions.map((p) => ({
    ...p.company,
    cvarUsd: p.exposureUsd,
  }));
  const seed = `portfolio:${positions
    .map((p) => p.company.id)
    .sort()
    .join(",")}:${confidence}`;
  const { positions: simPositions, config } = buildScenarioSimulation(companiesForSim, {
    severity: 100,
    confidence,
    seed,
  });
  const sim = simulatePortfolioLoss(simPositions, {
    ...config,
    trials: options.trials ?? 4000,
  });

  const sorted = [...positions].sort((a, b) => b.exposureUsd - a.exposureUsd);
  const topPositions: PositionShare[] = sorted.slice(0, 5).map((p) => ({
    company: p.company,
    exposureUsd: p.exposureUsd,
    sharePct: totalExposureUsd > 0 ? (p.exposureUsd / totalExposureUsd) * 100 : 0,
  }));

  const regionTotals = new Map<GeoRegion, number>();
  for (const p of positions) {
    regionTotals.set(
      p.company.region,
      (regionTotals.get(p.company.region) ?? 0) + p.exposureUsd
    );
  }
  const regionMix: RegionShare[] = [...regionTotals.entries()]
    .map(([region, exposureUsd]) => ({
      region,
      exposureUsd,
      sharePct: totalExposureUsd > 0 ? (exposureUsd / totalExposureUsd) * 100 : 0,
    }))
    .sort((a, b) => b.exposureUsd - a.exposureUsd);

  return {
    positionCount: positions.length,
    totalExposureUsd,
    cvarUsd: sim.cvarUsd,
    varUsd: sim.varUsd,
    expectedLossUsd: sim.expectedLossUsd,
    diversificationBenefitUsd: sim.diversificationBenefitUsd,
    riskIndex,
    atRiskCount: positions.filter((p) => p.company.score >= 50).length,
    criticalCount: positions.filter((p) => p.company.score >= 70).length,
    topConcentration: totalExposureUsd > 0 ? sorted[0].exposureUsd / totalExposureUsd : 0,
    topPositions,
    regionMix,
  };
}

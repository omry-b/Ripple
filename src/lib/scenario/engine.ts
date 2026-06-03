import type {
  Company,
  GeoRegion,
  Scenario,
  ScenarioRunOptions,
  SimulationRun,
} from "@/types/domain";
import { contagionEntityNames } from "@/lib/scenario/graph-propagation";
import { simulateScenarioLoss } from "@/lib/scenario/monte-carlo";

/**
 * Fallback portfolio used when no live company data is supplied (e.g. the
 * in-memory mock path before seeding). Exposures are derived from the scenario's
 * own profile so the simulation is still non-degenerate and scenario-specific.
 */
function syntheticPortfolio(scenario: Scenario): Company[] {
  return scenario.profile.map((magnitude, i) => ({
    id: `${scenario.id}-pos-${i}`,
    name: `${scenario.name} exposure ${i + 1}`,
    region: "APAC" as GeoRegion,
    score: Math.min(100, Math.max(20, magnitude)),
    tier: i % 2 === 0 ? "Tier 1" : "Tier 2",
    cvar: "",
    cvarUsd: 1.5e9 + magnitude * 4e7,
    delta7d: "",
    deltaTrend: "bad" as const,
    contagionHops: 1,
    scoreLevel: "elevated" as const,
    history30d: [],
  }));
}

export function runScenarioEngine(
  scenario: Scenario,
  options?: ScenarioRunOptions,
  contagionEntities?: string[],
  companies?: Company[]
): SimulationRun {
  const severity = (options?.severity ?? 100) / 100;
  const durationDays = options?.durationDays ?? 30;
  const region: GeoRegion = options?.region ?? "APAC";
  const confidence = options?.cvarLevel ?? 95;
  const profile = scenario.profile.map((v) => Math.min(100, Math.round(v * severity)));
  const suffix =
    severity !== 1 || durationDays !== 30
      ? ` · ${Math.round(severity * 100)}% · ${durationDays}d · ${region}`
      : "";

  const portfolio = companies && companies.length > 0 ? companies : syntheticPortfolio(scenario);
  const { histogram, result } = simulateScenarioLoss(portfolio, {
    severity: options?.severity ?? 100,
    confidence,
    // Seed by scenario + parameters so identical runs reproduce exactly while
    // distinct scenarios/severities diverge.
    seed: `${scenario.id}:${severity}:${durationDays}:${region}:${confidence}`,
  });

  return {
    id: `run-${Date.now()}`,
    scenarioId: scenario.id,
    scenarioName: scenario.name + suffix,
    ranAt: new Date().toISOString(),
    profile,
    impacts: [...scenario.impacts],
    lossDistribution: histogram,
    contagionEntities: (contagionEntities ?? contagionEntityNames(region)).slice(0, 8),
    shock: {
      region,
      durationDays,
      severity: Math.round(severity * 100),
      description: scenario.subtitle,
    },
    riskMetrics: {
      confidence,
      trials: result.trials,
      expectedLossUsd: result.expectedLossUsd,
      varUsd: result.varUsd,
      cvarUsd: result.cvarUsd,
      p99Usd: result.p99Usd,
      diversificationRatio: result.diversificationRatio,
      diversificationBenefitUsd: result.diversificationBenefitUsd,
    },
  };
}

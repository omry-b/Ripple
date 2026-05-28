import type { GeoRegion, Scenario, ScenarioRunOptions, SimulationRun } from "@/types/domain";
import { contagionEntityNames } from "@/lib/scenario/graph-propagation";
import { monteCarloLossBins } from "@/lib/scenario/monte-carlo";
import { getCvarMultiplier } from "@/lib/risk/cvar-config";

export function runScenarioEngine(
  scenario: Scenario,
  options?: ScenarioRunOptions,
  contagionEntities?: string[]
): SimulationRun {
  const severity = (options?.severity ?? 100) / 100;
  const durationDays = options?.durationDays ?? 30;
  const region: GeoRegion = options?.region ?? "APAC";
  const cvarMult = getCvarMultiplier(options?.cvarLevel ?? 95);
  const profile = scenario.profile.map((v) => Math.min(100, Math.round(v * severity)));
  const suffix =
    severity !== 1 || durationDays !== 30
      ? ` · ${Math.round(severity * 100)}% · ${durationDays}d · ${region}`
      : "";

  return {
    id: `run-${Date.now()}`,
    scenarioId: scenario.id,
    scenarioName: scenario.name + suffix,
    ranAt: new Date().toISOString(),
    profile,
    impacts: [...scenario.impacts],
    lossDistribution: monteCarloLossBins(severity * cvarMult, scenario.id.length),
    contagionEntities: (contagionEntities ?? contagionEntityNames(region)).slice(0, 8),
    shock: {
      region,
      durationDays,
      severity: Math.round(severity * 100),
      description: scenario.subtitle,
    },
  };
}

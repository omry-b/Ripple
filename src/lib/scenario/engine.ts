import type { GeoRegion, Scenario, ScenarioRunOptions, SimulationRun } from "@/types/domain";
import { monteCarloLossBins, topContagionEntities } from "@/lib/scenario/monte-carlo";

export function runScenarioEngine(
  scenario: Scenario,
  options?: ScenarioRunOptions
): SimulationRun {
  const severity = (options?.severity ?? 100) / 100;
  const durationDays = options?.durationDays ?? 30;
  const region: GeoRegion = options?.region ?? "APAC";
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
    lossDistribution: monteCarloLossBins(severity, scenario.id.length),
    contagionEntities: topContagionEntities(scenario.name),
    shock: {
      region,
      durationDays,
      severity: Math.round(severity * 100),
      description: scenario.subtitle,
    },
  };
}

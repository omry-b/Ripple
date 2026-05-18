import type { Scenario, ScenarioRunOptions, SimulationRun } from "@/types/domain";

export function runScenarioEngine(
  scenario: Scenario,
  options?: ScenarioRunOptions
): SimulationRun {
  const severity = (options?.severity ?? 100) / 100;
  const durationDays = options?.durationDays ?? 30;
  const profile = scenario.profile.map((v) => Math.min(100, Math.round(v * severity)));
  const suffix =
    severity !== 1 || durationDays !== 30
      ? ` · ${Math.round(severity * 100)}% · ${durationDays}d`
      : "";

  return {
    id: `run-${Date.now()}`,
    scenarioId: scenario.id,
    scenarioName: scenario.name + suffix,
    ranAt: new Date().toISOString(),
    profile,
    impacts: [...scenario.impacts],
  };
}

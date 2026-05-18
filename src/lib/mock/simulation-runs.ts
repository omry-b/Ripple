import type { Scenario, ScenarioRunOptions, SimulationRun } from "@/types/domain";

const runs: SimulationRun[] = [];

export const simulationRunStore = {
  run(scenario: Scenario, options?: ScenarioRunOptions): SimulationRun {
    const severity = (options?.severity ?? 100) / 100;
    const durationDays = options?.durationDays ?? 30;
    const profile = scenario.profile.map((v) =>
      Math.min(100, Math.round(v * severity))
    );
    const suffix =
      severity !== 1 || durationDays !== 30
        ? ` · ${Math.round(severity * 100)}% · ${durationDays}d`
        : "";

    const run: SimulationRun = {
      id: `run-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name + suffix,
      ranAt: new Date().toISOString(),
      profile,
      impacts: [...scenario.impacts],
    };
    runs.unshift(run);
    if (runs.length > 10) runs.pop();
    return run;
  },

  list(): SimulationRun[] {
    return [...runs];
  },

  get(id: string): SimulationRun | undefined {
    return runs.find((r) => r.id === id);
  },
};

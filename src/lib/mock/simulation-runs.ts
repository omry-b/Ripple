import type { Scenario, SimulationRun } from "@/types/domain";

const runs: SimulationRun[] = [];

export const simulationRunStore = {
  run(scenario: Scenario): SimulationRun {
    const run: SimulationRun = {
      id: `run-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      ranAt: new Date().toISOString(),
      profile: [...scenario.profile],
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

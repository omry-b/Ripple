import type { Scenario, ScenarioRunOptions, SimulationRun } from "@/types/domain";
import { runScenarioEngine } from "@/lib/scenario/engine";

const runs: SimulationRun[] = [];

export const simulationRunStore = {
  run(scenario: Scenario, options?: ScenarioRunOptions): SimulationRun {
    const run = runScenarioEngine(scenario, options);
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

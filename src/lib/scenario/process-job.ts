import type { ScenarioRunOptions, SimulationRun } from "@/types/domain";
import { getDataSource } from "@/lib/data";

export async function processScenarioJob(
  scenarioId: string,
  options?: ScenarioRunOptions
): Promise<SimulationRun> {
  const data = await getDataSource();
  const run = await data.runScenario(scenarioId, options);
  if (!run) {
    throw new Error("Scenario not found");
  }
  return run;
}

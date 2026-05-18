import type { ScenarioRunOptions, SimulationRun } from "@/types/domain";
import { mockStore } from "@/lib/mock/store";
import { simulationRunStore } from "@/lib/mock/simulation-runs";

export type ScenarioJobStatus = "queued" | "running" | "completed" | "failed";

export type ScenarioJob = {
  id: string;
  scenarioId: string;
  status: ScenarioJobStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
  run?: SimulationRun;
};

const jobs = new Map<string, ScenarioJob>();

export function enqueueScenarioJob(
  scenarioId: string,
  options?: ScenarioRunOptions
): ScenarioJob {
  const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const job: ScenarioJob = {
    id,
    scenarioId,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  jobs.set(id, job);

  setTimeout(() => {
    const current = jobs.get(id);
    if (!current || current.status !== "queued") return;
    current.status = "running";
    jobs.set(id, current);

    try {
      const scenario = mockStore.getScenario(scenarioId);
      if (!scenario) {
        current.status = "failed";
        current.error = "Scenario not found";
        current.completedAt = new Date().toISOString();
        jobs.set(id, current);
        return;
      }

      const run = simulationRunStore.run(scenario, options);
      current.status = "completed";
      current.run = run;
      current.completedAt = new Date().toISOString();
      jobs.set(id, current);
    } catch (e) {
      current.status = "failed";
      current.error = e instanceof Error ? e.message : "Simulation failed";
      current.completedAt = new Date().toISOString();
      jobs.set(id, current);
    }
  }, 400);

  return job;
}

export function getScenarioJob(id: string): ScenarioJob | undefined {
  return jobs.get(id);
}

/** Synchronous run for tests and direct API. */
export function runScenarioSync(
  scenarioId: string,
  options?: ScenarioRunOptions
): SimulationRun | null {
  const scenario = mockStore.getScenario(scenarioId);
  if (!scenario) return null;
  return simulationRunStore.run(scenario, options);
}

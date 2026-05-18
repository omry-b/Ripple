import type { ScenarioRunOptions, SimulationRun } from "@/types/domain";
import {
  createScenarioJob,
  getScenarioJobById,
} from "@/lib/scenario/job-store";
import { drainScenarioJobQueue } from "@/lib/scenario/worker";
import { isDatabaseConfigured } from "@/lib/db/client";

export type ScenarioJobStatus = "queued" | "running" | "completed" | "failed";

export type ScenarioJob = {
  id: string;
  scenarioId: string;
  status: ScenarioJobStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
  run?: SimulationRun;
  options?: ScenarioRunOptions;
};

export async function enqueueScenarioJob(
  scenarioId: string,
  options?: ScenarioRunOptions
): Promise<ScenarioJob> {
  const job = await createScenarioJob(scenarioId, options);

  if (!isDatabaseConfigured()) {
    setTimeout(() => {
      void drainScenarioJobQueue(1);
    }, 400);
  }

  return job;
}

export async function getScenarioJob(id: string): Promise<ScenarioJob | undefined> {
  return getScenarioJobById(id);
}

import { processScenarioJob } from "@/lib/scenario/process-job";
import {
  getJobOptions,
  listQueuedScenarioJobs,
  updateScenarioJob,
} from "@/lib/scenario/job-store";

export type WorkerDrainResult = {
  processed: number;
  failed: number;
  jobIds: string[];
};

export async function drainScenarioJobQueue(maxJobs = 5): Promise<WorkerDrainResult> {
  const queued = await listQueuedScenarioJobs(maxJobs);
  const jobIds: string[] = [];
  let processed = 0;
  let failed = 0;

  for (const job of queued) {
    jobIds.push(job.id);
    await updateScenarioJob(job.id, { status: "running" });

    try {
      const options = await getJobOptions(job.id);
      const run = await processScenarioJob(job.scenarioId, options);
      await updateScenarioJob(job.id, {
        status: "completed",
        run,
        completedAt: new Date().toISOString(),
      });
      processed += 1;
    } catch (e) {
      failed += 1;
      await updateScenarioJob(job.id, {
        status: "failed",
        error: e instanceof Error ? e.message : "Simulation failed",
        completedAt: new Date().toISOString(),
      });
    }
  }

  return { processed, failed, jobIds };
}

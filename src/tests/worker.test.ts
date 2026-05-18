import { describe, expect, it } from "vitest";
import { enqueueScenarioJob, getScenarioJob } from "../lib/scenario/job-queue";
import { drainScenarioJobQueue } from "../lib/scenario/worker";

describe("scenario worker", () => {
  it("completes async job after drain", async () => {
    const job = await enqueueScenarioJob("taiwan-closure", { severity: 80 });
    expect(job.status).toBe("queued");

    await drainScenarioJobQueue(1);

    const polled = await getScenarioJob(job.id);
    expect(polled?.status).toBe("completed");
    expect(polled?.run?.scenarioId).toBe("taiwan-closure");
  });
});

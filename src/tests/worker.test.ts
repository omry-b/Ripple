import { describe, expect, it } from "vitest";
import { enqueueScenarioJob, getScenarioJob } from "../lib/scenario/job-queue";

describe("scenario worker (memory)", () => {
  it("completes async job in memory mode", async () => {
    const job = await enqueueScenarioJob("taiwan-closure", { severity: 80 });
    expect(job.status).toBe("queued");

    let polled = job;
    for (let i = 0; i < 30; i += 1) {
      await new Promise((r) => setTimeout(r, 200));
      polled = (await getScenarioJob(job.id)) ?? polled;
      if (polled.status === "completed" || polled.status === "failed") break;
    }

    expect(polled.status).toBe("completed");
    expect(polled.run?.scenarioId).toBe("taiwan-closure");
  }, 15_000);
});

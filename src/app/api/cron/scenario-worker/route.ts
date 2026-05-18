import { drainScenarioJobQueue } from "@/lib/scenario/worker";
import { listQueuedScenarioJobs } from "@/lib/scenario/job-store";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const before = (await listQueuedScenarioJobs(100)).length;
  const result = await drainScenarioJobQueue(5);
  const after = (await listQueuedScenarioJobs(100)).length;

  return Response.json({
    asOf: new Date().toISOString(),
    queuedBefore: before,
    queuedAfter: after,
    ...result,
  });
}

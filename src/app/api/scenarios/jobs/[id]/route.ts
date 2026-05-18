import { getScenarioJob } from "@/lib/scenario/job-queue";
import { jsonData, jsonError } from "@/lib/api/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const job = await getScenarioJob(id);
  if (!job) {
    return jsonError("Job not found", 404);
  }
  return jsonData({ job });
}

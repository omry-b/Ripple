import { getSimulationRuns } from "@/lib/api";

export async function GET() {
  const runs = await getSimulationRuns();
  return Response.json({ asOf: new Date().toISOString(), runs });
}

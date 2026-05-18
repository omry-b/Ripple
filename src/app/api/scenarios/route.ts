import { getScenarios } from "@/lib/api";

export async function GET() {
  const data = await getScenarios();
  return Response.json({ asOf: new Date().toISOString(), scenarios: data });
}

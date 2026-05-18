import { getDataSource } from "@/lib/data";

export async function GET() {
  const data = await getDataSource();
  const runs = await data.getIngestRuns(30);
  return Response.json({ asOf: new Date().toISOString(), runs });
}

import { getCompanies } from "@/lib/api";

export async function GET() {
  const data = await getCompanies();
  return Response.json({ asOf: new Date().toISOString(), companies: data });
}

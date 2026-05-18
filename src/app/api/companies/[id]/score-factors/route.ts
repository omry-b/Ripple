import { getCompany, getScoreFactors } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }
  const factors = await getScoreFactors(id);
  return Response.json({ asOf: new Date().toISOString(), companyId: id, factors });
}

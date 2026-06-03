import { getScopedCompanies } from "@/lib/api/scoped";
import { getCompanyActivity } from "@/lib/companies/activity";
import { dataApiCacheHeaders, jsonData, jsonError } from "@/lib/api/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const companies = await getScopedCompanies(request);
    const company = companies.find((c) => c.id === id);
    if (!company) {
      return jsonError("Company not found", 404);
    }
    const activity = await getCompanyActivity(id, company.name);
    return jsonData(
      { companyId: id, companyName: company.name, ...activity },
      200,
      dataApiCacheHeaders()
    );
  } catch {
    return jsonError("Failed to load company activity", 500);
  }
}

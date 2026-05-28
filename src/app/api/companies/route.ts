import { getScopedCompanies } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  const companies = await getScopedCompanies(request);
  return jsonData({ companies }, 200, dataApiCacheHeaders());
}

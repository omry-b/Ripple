import { getScopedCompanies } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/with-handler";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const companies = await getScopedCompanies(request);
    return jsonData({ companies }, 200, dataApiCacheHeaders());
  });
}

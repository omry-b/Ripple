import { getScopedDashboard } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  const data = await getScopedDashboard(request);
  return jsonData(data, 200, dataApiCacheHeaders());
}

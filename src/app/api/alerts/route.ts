import { getScopedAlerts } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  const alerts = await getScopedAlerts(request);
  return jsonData({ alerts }, 200, dataApiCacheHeaders());
}

import { getScopedAlerts } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/with-handler";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const alerts = await getScopedAlerts(request);
    return jsonData({ alerts }, 200, dataApiCacheHeaders());
  });
}

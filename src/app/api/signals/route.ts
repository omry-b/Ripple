import { getSignals } from "@/lib/api";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/with-handler";

export async function GET() {
  return withApiHandler(async () => {
    const signals = await getSignals();
    return jsonData({ signals }, 200, dataApiCacheHeaders());
  });
}

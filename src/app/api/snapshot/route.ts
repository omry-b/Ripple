import { getScopedSnapshot } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/with-handler";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const snapshot = await getScopedSnapshot(request);
    return jsonData({ snapshot }, 200, dataApiCacheHeaders());
  });
}

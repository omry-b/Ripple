import { getScopedSnapshot } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  const snapshot = await getScopedSnapshot(request);
  return jsonData({ snapshot }, 200, dataApiCacheHeaders());
}

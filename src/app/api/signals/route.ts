import { getSignals } from "@/lib/api";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";

export async function GET() {
  const signals = await getSignals();
  return jsonData({ signals }, 200, dataApiCacheHeaders());
}

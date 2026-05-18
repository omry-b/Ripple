import { getSignals } from "@/lib/api";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET() {
  const signals = await getSignals();
  return jsonData({ signals }, 200, CACHE_PUBLIC_SHORT);
}

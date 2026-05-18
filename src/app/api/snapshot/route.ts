import { getSnapshot } from "@/lib/api";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET() {
  const snapshot = await getSnapshot();
  return jsonData({ snapshot }, 200, CACHE_PUBLIC_SHORT);
}

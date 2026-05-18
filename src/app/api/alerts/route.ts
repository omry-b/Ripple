import { getAlerts } from "@/lib/api";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET() {
  const alerts = await getAlerts();
  return jsonData({ alerts }, 200, CACHE_PUBLIC_SHORT);
}

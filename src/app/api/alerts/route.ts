import { getScopedAlerts } from "@/lib/api/scoped";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  const alerts = await getScopedAlerts(request);
  return jsonData({ alerts }, 200, CACHE_PUBLIC_SHORT);
}

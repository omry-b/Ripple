import { getSessionUser } from "@/lib/auth/session";
import { pruneDuplicateOpenAlerts } from "@/lib/alerts/prune-duplicates";
import { jsonData, jsonError } from "@/lib/api/response";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (user.role !== "admin") {
    return jsonError("Admin role required", 403);
  }

  const pruned = await pruneDuplicateOpenAlerts();
  return jsonData({ pruned, asOf: new Date().toISOString() });
}

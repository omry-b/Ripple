import { getScopedDashboard } from "@/lib/api/scoped";
import { dataApiCacheHeaders, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const data = await getScopedDashboard(request);
    return jsonData(data, 200, dataApiCacheHeaders());
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dashboard load failed";
    console.error("[api/dashboard]", message, e);
    return Response.json(
      { asOf: new Date().toISOString(), error: message },
      { status: 500, headers: dataApiCacheHeaders() }
    );
  }
}

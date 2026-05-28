import { refreshSnapshot } from "@/lib/api";
import { authorizeServiceRequest } from "@/lib/auth/service-secret";

export async function POST(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await refreshSnapshot();
    return Response.json({
      asOf: new Date().toISOString(),
      snapshot,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Refresh failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}

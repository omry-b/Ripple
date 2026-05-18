import { refreshSnapshot } from "@/lib/api";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
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

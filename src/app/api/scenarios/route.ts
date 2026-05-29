import { getScenarios } from "@/lib/api";

export async function GET() {
  try {
    const data = await getScenarios();
    return Response.json({ asOf: new Date().toISOString(), scenarios: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scenarios load failed";
    console.error("[api/scenarios]", message, e);
    return Response.json(
      { asOf: new Date().toISOString(), error: message },
      { status: 500 }
    );
  }
}

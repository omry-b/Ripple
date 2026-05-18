import { getSignals } from "@/lib/api";

export async function GET() {
  const data = await getSignals();
  return Response.json({ asOf: new Date().toISOString(), signals: data });
}

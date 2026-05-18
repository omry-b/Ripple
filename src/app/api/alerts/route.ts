import { getAlerts } from "@/lib/api";

export async function GET() {
  const data = await getAlerts();
  return Response.json({ asOf: new Date().toISOString(), alerts: data });
}

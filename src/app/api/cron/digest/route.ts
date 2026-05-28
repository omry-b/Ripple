import { getAlerts } from "@/lib/api";
import { sendWatchlistDigest } from "@/lib/notifications/digest";
import { authorizeServiceRequest } from "@/lib/auth/service-secret";

export async function GET(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getAlerts();
  const open = alerts.filter((a) => a.status === "open");
  const to = process.env.DIGEST_EMAIL_TO ?? "analyst@ripple.demo";

  const result = await sendWatchlistDigest({
    to,
    frequency: "daily",
    alerts: open,
    companyCount: 12,
  });

  return Response.json({
    asOf: new Date().toISOString(),
    alertCount: open.length,
    ...result,
  });
}

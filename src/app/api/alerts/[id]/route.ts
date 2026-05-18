import { acknowledgeAlert, getAlert, resolveAlert } from "@/lib/api";
import { jsonError, jsonOk } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";
import { deliverWebhookToOrg } from "@/lib/webhooks/delivery";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const alert = await getAlert(id);
    if (!alert) return jsonError("Alert not found", 404);
    return jsonOk({ alert });
  } catch {
    return jsonError("Failed to load alert", 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { action?: string };

    const user = await getSessionUser(request);

    if (body.action === "acknowledge") {
      const alert = await acknowledgeAlert(id);
      if (!alert) return jsonError("Alert not found", 404);
      void deliverWebhookToOrg(user.organizationId, "alert.acknowledged", {
        alertId: alert.id,
        title: alert.title,
        status: alert.status,
      });
      return jsonOk({ alert });
    }

    if (body.action === "resolve") {
      const alert = await resolveAlert(id);
      if (!alert) return jsonError("Alert not found", 404);
      void deliverWebhookToOrg(user.organizationId, "alert.resolved", {
        alertId: alert.id,
        title: alert.title,
        status: alert.status,
      });
      return jsonOk({ alert });
    }

    return jsonError("Unknown action", 400);
  } catch {
    return jsonError("Failed to update alert", 500);
  }
}

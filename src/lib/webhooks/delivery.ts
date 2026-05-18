import type { Alert } from "@/types/domain";
import { getDataSource } from "@/lib/data";
import { signWebhookPayload } from "@/lib/webhooks/sign";

const subscriptionSecrets = new Map<string, string>();

export function rememberSubscriptionSecret(subscriptionId: string, secret: string) {
  subscriptionSecrets.set(subscriptionId, secret);
}

export function getSubscriptionSecret(subscriptionId: string): string | undefined {
  return subscriptionSecrets.get(subscriptionId);
}

export async function deliverWebhookToOrg(
  organizationId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<{ delivered: number; failed: number }> {
  const data = await getDataSource();
  const subs = await data.getWebhookSubscriptions(organizationId);
  const body = JSON.stringify({ event, ...payload, asOf: new Date().toISOString() });
  const timestamp = String(Math.floor(Date.now() / 1000));

  let delivered = 0;
  let failed = 0;

  for (const sub of subs) {
    if (!sub.enabled || !sub.events.includes(event)) continue;
    const secret = subscriptionSecrets.get(sub.id) ?? process.env.WEBHOOK_SIGNING_SECRET ?? "ripple-demo-secret";
    const signature = signWebhookPayload(secret, body, timestamp);

    try {
      const res = await fetch(sub.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ripple-Timestamp": timestamp,
          "X-Ripple-Signature": signature,
          "X-Ripple-Event": event,
        },
        body,
      });
      if (res.ok) delivered += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }

  return { delivered, failed };
}

export async function deliverAlertWebhook(alert: Alert, organizationId: string) {
  const event = alert.level === "critical" ? "alert.critical" : "alert.elevated";
  return deliverWebhookToOrg(organizationId, event, {
    alertId: alert.id,
    title: alert.title,
    status: alert.status,
  });
}

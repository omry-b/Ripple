import type { Alert } from "@/types/domain";
import { DEMO_ORG_ID } from "@/lib/db/seed";
import { deliverWebhookToOrg } from "@/lib/webhooks/delivery";

export type NotificationChannel = "slack" | "email" | "pagerduty" | "webhook";

export type NotificationPayload = {
  channel: NotificationChannel;
  title: string;
  body: string;
  alert?: Alert;
  metadata?: Record<string, string>;
};

async function sendResendEmail(
  apiKey: string,
  payload: NotificationPayload
): Promise<{ ok: boolean; message: string }> {
  const to = payload.metadata?.to ?? process.env.DIGEST_EMAIL_TO ?? "analyst@ripple.demo";
  const from = process.env.RESEND_FROM ?? "Ripple <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: payload.title,
        text: payload.body,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, message: `Resend HTTP ${res.status}: ${err.slice(0, 120)}` };
    }
    return { ok: true, message: `Email sent to ${to}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Resend failed" };
  }
}

async function sendPagerDuty(
  routingKey: string,
  payload: NotificationPayload
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routing_key: routingKey,
        event_action: "trigger",
        payload: {
          summary: payload.title,
          severity: "critical",
          source: "ripple",
          custom_details: { body: payload.body },
        },
      }),
    });
    if (!res.ok) {
      return { ok: false, message: `PagerDuty HTTP ${res.status}` };
    }
    return { ok: true, message: "PagerDuty event enqueued" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "PagerDuty failed" };
  }
}

export async function dispatchNotification(payload: NotificationPayload): Promise<{
  sent: boolean;
  channel: NotificationChannel;
  message: string;
}> {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const pagerKey = process.env.PAGERDUTY_ROUTING_KEY;
  const orgId = process.env.DEFAULT_ORG_ID ?? DEMO_ORG_ID;

  switch (payload.channel) {
    case "slack":
      if (!slackUrl) {
        return { sent: false, channel: "slack", message: "SLACK_WEBHOOK_URL not set" };
      }
      try {
        const res = await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*${payload.title}*\n${payload.body}`,
          }),
        });
        if (!res.ok) {
          return { sent: false, channel: "slack", message: `Slack HTTP ${res.status}` };
        }
        return { sent: true, channel: "slack", message: "Delivered to Slack" };
      } catch (e) {
        return {
          sent: false,
          channel: "slack",
          message: e instanceof Error ? e.message : "Slack failed",
        };
      }

    case "email": {
      if (!resendKey) {
        return { sent: false, channel: "email", message: "RESEND_API_KEY not set" };
      }
      const result = await sendResendEmail(resendKey, payload);
      return { sent: result.ok, channel: "email", message: result.message };
    }

    case "pagerduty": {
      if (!pagerKey) {
        return { sent: false, channel: "pagerduty", message: "PAGERDUTY_ROUTING_KEY not set" };
      }
      const result = await sendPagerDuty(pagerKey, payload);
      return { sent: result.ok, channel: "pagerduty", message: result.message };
    }

    case "webhook": {
      const { delivered, failed } = await deliverWebhookToOrg(orgId, "notification.dispatch", {
        title: payload.title,
        body: payload.body,
        alertId: payload.alert?.id,
      });
      if (delivered === 0) {
        return {
          sent: false,
          channel: "webhook",
          message:
            failed > 0
              ? "Webhook delivery failed"
              : "No enabled webhook subscriptions for this org",
        };
      }
      return {
        sent: true,
        channel: "webhook",
        message: `Delivered to ${delivered} webhook(s)`,
      };
    }

    default:
      return { sent: false, channel: payload.channel, message: "Unknown channel" };
  }
}

export async function notifyCriticalAlert(alert: Alert, organizationId?: string): Promise<void> {
  if (alert.level !== "critical" || alert.status !== "open") return;

  const orgId = organizationId ?? process.env.DEFAULT_ORG_ID ?? DEMO_ORG_ID;

  await Promise.all([
    dispatchNotification({
      channel: "slack",
      title: `Critical alert: ${alert.title}`,
      body: alert.detail,
      alert,
    }),
    deliverWebhookToOrg(orgId, "alert.critical", {
      alertId: alert.id,
      title: alert.title,
      status: alert.status,
    }),
  ]);
}

import type { Alert } from "@/types/domain";

export type NotificationChannel = "slack" | "email" | "pagerduty" | "webhook";

export type NotificationPayload = {
  channel: NotificationChannel;
  title: string;
  body: string;
  alert?: Alert;
  metadata?: Record<string, string>;
};

/**
 * Placeholder notification dispatcher — logs only until keys are configured.
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<{
  sent: boolean;
  channel: NotificationChannel;
  message: string;
}> {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const pagerKey = process.env.PAGERDUTY_ROUTING_KEY;

  switch (payload.channel) {
    case "slack":
      if (!slackUrl) {
        console.info("[notifications:slack:placeholder]", payload.title, payload.body);
        return { sent: false, channel: "slack", message: "SLACK_WEBHOOK_URL not set" };
      }
      // PLACEHOLDER: await fetch(slackUrl, { method: 'POST', body: JSON.stringify({ text: payload.body }) })
      return { sent: true, channel: "slack", message: "Slack dispatch stub" };

    case "email":
      if (!resendKey) {
        console.info("[notifications:email:placeholder]", payload.title);
        return { sent: false, channel: "email", message: "RESEND_API_KEY not set" };
      }
      return { sent: true, channel: "email", message: "Email dispatch stub" };

    case "pagerduty":
      if (!pagerKey) {
        console.info("[notifications:pagerduty:placeholder]", payload.title);
        return { sent: false, channel: "pagerduty", message: "PAGERDUTY_ROUTING_KEY not set" };
      }
      return { sent: true, channel: "pagerduty", message: "PagerDuty dispatch stub" };

    case "webhook":
      console.info("[notifications:webhook:placeholder]", payload.title);
      return { sent: false, channel: "webhook", message: "Customer webhook delivery not wired" };

    default:
      return { sent: false, channel: payload.channel, message: "Unknown channel" };
  }
}

export async function notifyCriticalAlert(alert: Alert): Promise<void> {
  if (alert.level !== "critical") return;
  await dispatchNotification({
    channel: "slack",
    title: `Critical alert: ${alert.title}`,
    body: alert.detail,
    alert,
  });
}

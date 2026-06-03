import { getDataSource } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";
import { generateWebhookSecret } from "@/lib/webhooks/sign";
import { rememberSubscriptionSecret } from "@/lib/webhooks/delivery";
import { checkWebhookUrl } from "@/lib/webhooks/url-guard";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  const data = await getDataSource();
  const subscriptions = await data.getWebhookSubscriptions(user.organizationId);
  return Response.json({ asOf: new Date().toISOString(), subscriptions });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (user.role === "viewer") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { url?: string; events?: string[] };
  if (!body.url) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  // SSRF guard: only allow public https endpoints (no internal/loopback targets).
  const urlCheck = checkWebhookUrl(body.url);
  if (!urlCheck.ok) {
    return Response.json({ error: urlCheck.reason }, { status: 400 });
  }

  const data = await getDataSource();
  const subscription = await data.createWebhookSubscription(
    user.organizationId,
    body.url,
    body.events ?? ["alert.critical", "signal.elevated"]
  );

  const signingSecret = generateWebhookSecret();
  rememberSubscriptionSecret(subscription.id, signingSecret);

  return Response.json(
    {
      asOf: new Date().toISOString(),
      subscription,
      signingSecret,
      note: "Store signingSecret securely. Verify X-Ripple-Signature HMAC-SHA256 on delivery.",
    },
    { status: 201 }
  );
}

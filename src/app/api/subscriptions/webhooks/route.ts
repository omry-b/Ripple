import { getDataSource } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";

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

  const data = await getDataSource();
  const subscription = await data.createWebhookSubscription(
    user.organizationId,
    body.url,
    body.events ?? ["alert.critical", "signal.elevated"]
  );

  return Response.json(
    {
      asOf: new Date().toISOString(),
      subscription,
      note: "PLACEHOLDER: webhook delivery will fire when ingest + alert engine are live",
    },
    { status: 201 }
  );
}

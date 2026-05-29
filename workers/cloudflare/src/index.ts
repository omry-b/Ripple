export interface Env {
  APP_URL: string;
  CRON_SECRET: string;
}

async function callRipple(env: Env, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${env.APP_URL.replace(/\/$/, "")}${path}`, {
    method: init?.method ?? "GET",
    ...init,
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET}`,
      ...(init?.headers ?? {}),
    },
  });
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const cron = event.cron;

    ctx.waitUntil(
      (async () => {
        if (cron === "*/5 * * * *") {
          const scenario = await callRipple(env, "/api/cron/scenario-worker");
          console.log("scenario-worker", scenario.status, await scenario.text());
          const snapshot = await callRipple(env, "/api/cron/snapshot-refresh");
          console.log("snapshot-refresh", snapshot.status, await snapshot.text());
          return;
        }
        if (cron === "0 */6 * * *") {
          const res = await callRipple(env, "/api/ingest/internal", { method: "POST" });
          console.log("ingest/internal", res.status, await res.text());
          return;
        }
        if (cron === "0 12 * * *") {
          const res = await callRipple(env, "/api/cron/daily");
          console.log("cron/daily", res.status, await res.text());
        }
      })()
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.searchParams.get("path") ?? "/api/health";
    const res = await callRipple(env, path);
    return new Response(await res.text(), { status: res.status });
  },
};

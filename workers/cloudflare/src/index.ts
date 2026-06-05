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
        const run = async (label: string, path: string) => {
          const res = await callRipple(env, path);
          console.log(label, res.status, await res.text());
        };

        /** Async scenario queue drain — frequent, for responsiveness. */
        if (cron === "*/15 * * * *") {
          await run("scenario-worker", "/api/cron/scenario-worker");
          return;
        }

        /**
         * Hourly multiplexer. Cloudflare's free plan caps Cron Triggers at 5 per
         * account, so rather than a separate trigger per cadence we run one hourly
         * trigger and derive the original schedule from the UTC hour:
         *   snapshot every 2h · stories every 4h · ingest every 6h · daily 12:00 UTC.
         */
        if (cron === "0 * * * *") {
          const hour = new Date(event.scheduledTime).getUTCHours();
          if (hour % 2 === 0) await run("snapshot-refresh", "/api/cron/snapshot-refresh");
          if (hour % 4 === 0) await run("stories-refresh", "/api/cron/stories-refresh");
          if (hour % 6 === 0) await run("ingest-scheduled", "/api/cron/ingest-scheduled");
          if (hour === 12) await run("cron/daily", "/api/cron/daily");
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

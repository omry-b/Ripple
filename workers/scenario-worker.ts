#!/usr/bin/env npx tsx
/**
 * Off-Vercel scenario worker — polls the Ripple cron endpoint.
 *
 * Usage:
 *   CRON_SECRET=xxx APP_URL=https://your-app.vercel.app npx tsx workers/scenario-worker.ts
 *
 * Run on Fly.io, Railway, or a local terminal alongside `npm run dev`.
 */
import "dotenv/config";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET ?? "";
const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS ?? 10_000);

async function tick(): Promise<void> {
  const res = await fetch(`${APP_URL}/api/cron/scenario-worker`, {
    headers: CRON_SECRET ? { Authorization: `Bearer ${CRON_SECRET}` } : {},
  });
  const body = await res.json();
  console.log(`[${new Date().toISOString()}]`, res.status, JSON.stringify(body));
}

async function main() {
  console.log(`Scenario worker → ${APP_URL} every ${INTERVAL_MS}ms`);
  await tick();
  setInterval(tick, INTERVAL_MS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

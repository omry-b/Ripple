# Scenario worker (off-Vercel)

Heavy scenario jobs are queued in Postgres (`scenario_jobs` table) and processed outside the serverless request path.

## Vercel cron (production)

`vercel.json` calls `GET /api/cron/scenario-worker` every 5 minutes with `Authorization: Bearer $CRON_SECRET`.

Set `CRON_SECRET` in Vercel → Environment Variables.

## Long-running worker (Railway / Fly / local)

```bash
export APP_URL=https://ripple-cs153.vercel.app
export CRON_SECRET=your-secret
npx tsx workers/scenario-worker.ts
```

Poll interval defaults to 10s (`WORKER_INTERVAL_MS`).

## Client flow

1. `POST /api/scenarios/{id}/run?async=true` → `{ job }` with status `queued`
2. Poll `GET /api/scenarios/jobs/{id}` until `completed` or `failed`
3. With Postgres, the cron/worker persists results to `simulation_runs`

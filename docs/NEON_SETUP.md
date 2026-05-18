# Neon Postgres on Vercel

## 1. Create Neon database

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (`?sslmode=require`).

## 2. Vercel integration (recommended)

1. Vercel dashboard → **Ripple** → **Storage** → **Connect Database** → **Neon**.
2. Link the Neon project — Vercel injects `DATABASE_URL` automatically.
3. Add the same variable for **Preview** and **Development** if you use preview deploys.

Or manually: **Settings** → **Environment Variables** → `DATABASE_URL`.

## 3. Apply schema & seed

After first deploy (or locally):

```bash
npm run db:push      # apply Drizzle schema (includes scenario_jobs)
npm run db:seed      # seed demo org + companies
npm run db:verify    # ping + idempotent seed check
```

## 4. Verify production

```bash
curl -s https://YOUR_APP/api/health | jq .database
```

Expect `"connected": true` and `"dataMode": "postgres"` in app logs / health.

## 5. Cron + worker

With Postgres, async scenario jobs persist in `scenario_jobs`. Vercel cron runs `/api/cron/scenario-worker` every 5 minutes. See [SCENARIO_WORKER.md](./SCENARIO_WORKER.md).

Ripple uses `getDataSource()` — when `DATABASE_URL` is set, Drizzle/Postgres is used automatically; otherwise mock data is used.

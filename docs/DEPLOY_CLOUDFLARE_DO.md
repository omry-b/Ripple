# Cloudflare + DigitalOcean architecture

```text
                    ┌─────────────────────────────────────┐
                    │  Cloudflare (DNS, CDN, cron worker)   │
                    │  workers/cloudflare → Bearer cron    │
                    └──────────────┬──────────────────────┘
                                   │
Users ──► CF proxy ──► Vercel ──────┼──► Next.js UI + API routes
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  DigitalOcean Managed PostgreSQL     │
                    │  DATABASE_URL on Vercel              │
                    └─────────────────────────────────────┘
```

## Cron schedule (Cloudflare Worker)

Only **2 triggers**, **set in the dashboard** (Worker → Settings → Triggers), not in
`wrangler.toml`: the git-connected Workers Build can't register cron schedules on
deploy, so the config omits `[triggers]` to keep CI builds green and `wrangler
deploy` leaves the dashboard-managed schedules untouched. The hourly trigger
multiplexes the slower jobs by UTC hour inside the worker
(`workers/cloudflare/src/index.ts`).

| Schedule | Effective cadence | Calls |
|----------|-------------------|-------|
| `*/15 * * * *` | every 15 min | `/api/cron/scenario-worker` (drain `scenario_jobs`) |
| `0 * * * *` → | hourly, dispatched by hour: | |
| · `hour % 2 == 0` | every 2 h | `/api/cron/snapshot-refresh` |
| · `hour % 4 == 0` | every 4 h | `/api/cron/stories-refresh` |
| · `hour % 6 == 0` | every 6 h | `/api/cron/ingest-scheduled` |
| · `hour == 12` | daily 12:00 UTC | `/api/cron/daily` |

Vercel Hobby daily cron remains a backup; CF Worker is the primary scheduler when deployed.

## Edge ingest (phase 2)

1. CF Worker fetches GDELT/NOAA/etc. at the edge.
2. Normalize to `NormalizedIngestEvent[]`.
3. Either:
   - **Queue** → consumer `POST /api/ingest/batch`, or
   - Call `/api/ingest/internal` from Worker (simpler; adapters still run on Vercel today).

## Heavy simulation (phase 3)

- Vercel enqueues scenario job (already async).
- DO App Platform / GPU Droplet runs extended Monte Carlo.
- Results written to `scenario_jobs` / `simulation_runs`; UI polls as today.

## Semantic triage (phase 4)

- DO Postgres + **pgvector** extension.
- Embeddings on ingest readings; similarity to companies; auto-score bumps.

Setup steps: [MANUAL_SETUP.md](./MANUAL_SETUP.md).

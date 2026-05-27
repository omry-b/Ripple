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

| Schedule | Calls | Purpose |
|----------|--------|---------|
| `*/5 * * * *` | `/api/cron/scenario-worker` | Drain `scenario_jobs` |
| `0 */6 * * *` | `/api/ingest/internal` | Full adapter ingest |
| `0 12 * * *` | `/api/cron/daily` | Snapshot + digest + drain |

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

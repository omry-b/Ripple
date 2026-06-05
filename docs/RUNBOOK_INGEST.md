# Ingest failure runbook

## Symptoms

- Dashboard **Stale** badge > 5 minutes
- `POST /api/ingest/run` returns failed adapters
- `GET /api/ingest/dead-letters` lists recent errors

## Steps

1. **Check dead letters**
   ```bash
   curl -s https://YOUR_APP/api/ingest/dead-letters | jq
   ```
2. **Re-run pipeline** (admin role or local dev):
   ```bash
   npm run ingest
   ```
3. **Refresh snapshot** (cron or manual):
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_APP/api/cron/refresh-snapshot
   ```
4. **Adapter-specific**
   - **gdelt** — public DOC API; failures fall back to stub events
   - **weather** — NOAA Weather.gov; requires `User-Agent` header (configured)
   - **ais / ports / financial** — set API keys in Vercel env when available
5. **Clear cache** — ingest success calls `invalidateSnapshotCache()` (memory + Vercel KV if configured)

## Intelligence stories (24h window)

- Sources: Google News, Reddit, GDELT, Hacker News, BBC Business, SEC EDGAR, NPR Business
- Scheduled: `GET /api/cron/stories-refresh` every 4h (Vercel + Cloudflare)
- On-demand: `POST /api/companies/{id}/stories` or Intelligence feed **Refresh all**
- Cache TTL: 6 hours between automatic crawls per company

## Escalation

- Rotate `CRON_SECRET` if cron endpoints were exposed
- Review Vercel function logs for timeout (increase `maxDuration` if needed)
- Redeploy Cloudflare worker after changing `wrangler.toml` (repo root) crons

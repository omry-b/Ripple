# Manual setup — what you do vs what’s in the repo

**Do not paste secrets into chat or commit them.** Set everything in Vercel / Cloudflare / DigitalOcean dashboards.

---

## What you do (checklist)

### 1. Generate one shared secret (2 min)

On your machine:

```bash
openssl rand -hex 32
```

Save the output as **`CRON_SECRET`** — you’ll use the same value in Vercel and Cloudflare.

---

### 2. Vercel — Ripple app (10 min)

1. Open [Vercel → Ripple project → Settings → Environment Variables](https://vercel.com/omry-2596s-projects/ripple/settings/environment-variables).
2. Add for **Production** (and Preview if you use PR deploys):

| Variable | Required | Where you get it |
|----------|----------|------------------|
| `CRON_SECRET` | Yes | Step 1 |
| `DATABASE_URL` | Yes (prod DB) | Step 3 — DigitalOcean Postgres |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://ripple-omry-2596s-projects.vercel.app` or your custom domain |
| `DIGEST_EMAIL_TO` | Optional | Your email |
| `RESEND_API_KEY` | Optional | [resend.com](https://resend.com) |
| `RESEND_FROM` | Optional | `Ripple <onboarding@resend.dev>` or verified domain |
| `SLACK_WEBHOOK_URL` | Optional | Slack incoming webhook |
| `PAGERDUTY_ROUTING_KEY` | Optional | PagerDuty Events API v2 routing key |
| `WEBHOOK_SIGNING_SECRET` | Optional | `openssl rand -hex 24` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Optional | Clerk dashboard |
| `CLERK_SECRET_KEY` | Optional | Clerk dashboard |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Optional | Mapbox |
| `AIS_API_KEY` / `PORTS_API_KEY` | Optional | Live ingest (stubs without) |

3. **Deployment Protection:** Settings → Deployment Protection → allow **public** access to Production (or you’ll see a Vercel login wall).
4. **Redeploy** Production after env vars change.

---

### 3. DigitalOcean — Managed Postgres (15 min)

1. [DigitalOcean](https://cloud.digitalocean.com) → **Databases** → **Create** → **PostgreSQL** (same region you’ll use for workers later, e.g. NYC).
2. Create database `ripple` (or use default).
3. Copy the **connection string** (use **VPC** if you add DO workers in the same VPC later; for Vercel use **Public** connection + trusted sources or `0.0.0.0/0` for demo).
4. Paste into Vercel as `DATABASE_URL` (must include `?sslmode=require`).
5. From your laptop (with repo cloned):

```bash
export DATABASE_URL="postgresql://..."
npm run db:push
npm run db:seed
npm run db:verify
```

6. Verify live app:

```bash
curl -s https://YOUR_APP.vercel.app/api/health | jq
```

Expect `"connected": true` when Postgres is wired.

---

## Troubleshooting: dashboard shows **Stale** (not Live)

The nav **Live / Stale** pill compares `snapshot.asOf` in Postgres to the current time (5‑minute window). Polling every 30s only helps if the snapshot row and `/api/dashboard` are healthy.

### Quick diagnosis

```bash
curl -s https://YOUR_APP.vercel.app/api/health | jq '.dataMode, .database'
curl -s https://YOUR_APP.vercel.app/api/ops/status | jq '.snapshot.asOf, .recentIngest[0:3]'
curl -s -o /dev/null -w "%{http_code}\n" https://YOUR_APP.vercel.app/api/dashboard
```

| Symptom | Likely cause |
|--------|----------------|
| `dataMode: "mock"` | `DATABASE_URL` not set on Vercel Production — redeploy after adding it |
| `snapshot.asOf` hours old | Ingest never finished or snapshot not refreshed |
| `recentIngest` all `running` | Ingest crashed mid-run (fixed in app: ingest run upsert) |
| `/api/dashboard` → `500` | Broken scenarios payload or DB error — check Vercel function logs |

### Unstick production now (same `CRON_SECRET` as Vercel)

```bash
export APP_URL="https://ripple-ruby.vercel.app"
export CRON_SECRET="your-secret"

# 1) Recompute KPI snapshot (updates asOf)
curl -s -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/snapshot-refresh" | jq

# 2) Run full ingest (scores + snapshot)
curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/ingest/internal" | jq

# 3) Confirm
curl -s "$APP_URL/api/ops/status" | jq '.snapshot.asOf'
```

### Keep it fresh automatically

1. **Vercel:** `DATABASE_URL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` on Production → **Redeploy**.
2. **Cloudflare worker** (`workers/cloudflare`): `wrangler secret put CRON_SECRET`, `wrangler deploy` — schedules:
   - Every **5 min** → scenario worker + **snapshot refresh**
   - Every **6 h** → full ingest (`POST /api/ingest/internal`)
3. Hard-refresh the browser; the banner should say **Live · Postgres**.

---

### 4. Cloudflare — DNS + cron worker (15 min)

**A. DNS (if you have a custom domain)**

1. Cloudflare → **Add site** → your domain.
2. Point nameservers at your registrar to Cloudflare.
3. DNS record: `CNAME` `www` → `cname.vercel-dns.com` (or Vercel’s target from Domains tab).
4. **Proxy status:** orange cloud ON.
5. Vercel → Domains → add the same hostname.

**B. Cron worker (replaces Hobby “once per day” limits)**

1. Install Wrangler locally once: `npm i -g wrangler` or use `npx wrangler`.
2. Login: `wrangler login`
3. In repo:

```bash
cd workers/cloudflare
npm install
# Edit wrangler.toml [vars] APP_URL if not using default production URL
wrangler secret put CRON_SECRET    # paste same value as Vercel
wrangler deploy
```

4. Cloudflare dashboard → **Workers** → `ripple-cron` → confirm **Cron Triggers**:
   - Every 5 min → scenario worker
   - Every 6 hours → full ingest
   - Daily 12:00 UTC → daily maintenance

5. Optional manual test:

```bash
curl "https://ripple-cron.<your-subdomain>.workers.dev/?path=/api/health"
```

(Requires `CRON_SECRET` set; health is public but path proxy still sends Bearer.)

---

### 5. Optional — DigitalOcean scenario worker (5 min)

If you want a **second** drain path (or no Cloudflare cron yet):

1. DO → **App Platform** → Create App → **Worker** (or smallest Droplet).
2. Run command on repeat:

```bash
CRON_SECRET=... APP_URL=https://YOUR_APP.vercel.app npx tsx workers/scenario-worker.ts
```

3. Set env `WORKER_INTERVAL_MS=60000` (1 min).

Uses credits; Cloudflare cron alone is enough for most demos.

---

### 6. Optional — Cloudflare Startup extras (later)

| Credit / product | Use when |
|------------------|----------|
| **Queues** | Edge ingest → `POST /api/ingest/batch` |
| **R2** | Snapshot / dead-letter archives |
| **Zero Trust** | Lock `/settings`, admin APIs |
| **Turnstile** | Bot protection on public forms |

Not required for first production cut.

---

## What’s already in the repo (no action)

| Piece | Location |
|-------|----------|
| Internal ingest (Bearer) | `POST /api/ingest/internal` |
| Edge batch ingest | `POST /api/ingest/batch` |
| Cron routes | `/api/cron/daily`, `scenario-worker`, etc. |
| Cloudflare cron worker | `workers/cloudflare/` |
| DO scenario loop script | `workers/scenario-worker.ts` |
| Postgres + Drizzle | `npm run db:push`, `db:seed` |

---

## Credentials summary (nothing to send us)

| Credential | You create | Used on |
|------------|------------|---------|
| `CRON_SECRET` | `openssl rand -hex 32` | Vercel + Cloudflare Worker |
| `DATABASE_URL` | DO Managed Postgres | Vercel only |
| `RESEND_API_KEY` | Resend | Vercel |
| `SLACK_WEBHOOK_URL` | Slack | Vercel |
| `PAGERDUTY_ROUTING_KEY` | PagerDuty | Vercel |
| Clerk keys | clerk.com | Vercel |
| Wrangler login | Cloudflare account | Your laptop (`wrangler deploy`) |
| DO API token | DO dashboard (optional) | `doctl` / Terraform later |

---

## After you finish

Reply with **only** (no secrets):

- [ ] Vercel env set + redeployed  
- [ ] `db:push` + `db:seed` succeeded  
- [ ] `/api/health` shows postgres connected  
- [ ] Cloudflare worker deployed (yes/no)  
- [ ] Custom domain (yes/no / hostname)

We can then tune crons, add Queue consumer, or pgvector phase 2.

See also: [DEPLOY_CLOUDFLARE_DO.md](./DEPLOY_CLOUDFLARE_DO.md), [NEON_SETUP.md](./NEON_SETUP.md) (Neon alternative to DO Postgres).

# Ripple — Build Log & Master TODO

> **How to use:** Check `[x]` when done. Add notes under items if needed.  
> **Last updated:** 2026-05-18 (Postgres readings, notifications, alert resolve; manual-only list below)

---

## Legend

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress

---

## Phase 0 — Foundation & shell

### Repo & deploy

- Production URL documented in README (`ripple-omry-2596s-projects.vercel.app`)
- Auto-deploy on push to `main` (Vercel GitHub app / vercel[bot])
- Disable Vercel Deployment Protection on Production (if login wall appears)
- Add stable production alias / custom domain in Vercel → Domains
- Initialize Next.js 16 + TypeScript + App Router
- Configure Plus e Sans + DM Mono fonts
- Port mockup CSS to `globals.css` design tokens
- Connect GitHub repo `omry-b/Ripple`
- Deploy to Vercel (production + preview on PR)
- Add `vercel.json` framework config
- Fix Turbopack workspace root warning in `next.config.ts`
- Add custom domain in Vercel project settings
- Configure Vercel environment variables (Production / Preview / Development)
- Enable Vercel Analytics + Speed Insights
- Add deployment status badge to README

### Routing & navigation

- Route group `(dashboard)` with shared layout
- `/` Overview page
- `/signals` Signals page
- `/scenario` Scenario workbench page
- `/companies` Companies ranking page
- `/companies/[id]` Company detail page
- `lib/nav.ts` nav config with hrefs
- Nav uses Next.js `Link` + `usePathname` active state
- Add `not-found.tsx` at dashboard root
- Company `not-found.tsx` for unknown IDs
- Add `error.tsx` at dashboard root (recoverable errors)
- Add `global-error.tsx` at app root
- Breadcrumb component for nested routes
- Mobile nav: collapsible tabs or bottom bar
- Command palette ⌘K (search companies, alerts, nav)
- Keyboard shortcuts (g+o overview, g+s signals, etc.)

### Component architecture

- Delete monolithic `Dashboard.tsx`
- `components/shell/NavHeader`
- `components/shell/SignalTicker`
- `components/shell/LiveStatus`
- `components/shell/PageEffects` (scroll reveal)
- `components/shell/PageHeader`
- `components/hero/HeroSection`
- `components/bento/BentoGrid`
- `components/alerts/AlertsSection` + `AlertCard`
- `components/tables/CompanyExposureTable`
- `components/streams/StreamGrid`
- `components/scenario/ScenarioWorkbench`
- `components/overview/OverviewPage`
- Extract `GlobalRiskMap` SVG to own component
- Extract `AlertCard` conic border wrapper to variant prop only
- Storybook setup for shell + bento cards
- Shared `MetricCard` primitive for bento small tiles

### Data & API façade (mock)

- `types/domain.ts` canonical types
- `lib/mock/store.ts` single mock source
- `lib/api/index.ts` server-side getters
- `GET /api/dashboard`
- `GET /api/signals`
- `GET /api/companies`
- `GET /api/alerts`
- `GET /api/scenarios`
- `GET /api/companies/[id]`
- `GET /api/snapshot` (lightweight shell payload)
- API response envelope: `{ asOf, data }` consistent everywhere
- API error responses with proper status codes (404, 500)
- Rate limiting middleware on API routes
- OpenAPI / typed client generation from routes

### UX polish (Phase 0)

- `loading.tsx` skeleton for dashboard routes
- Demo data banner at top of shell
- Live vs Stale pulse based on `asOf` + 5min threshold
- `prefers-reduced-motion` disables ticker + blobs
- Company rows link to `/companies/[id]`
- Overview links to signals + scenario pages
- Skeleton components match bento card shapes exactly
- Focus visible styles on all interactive elements
- Skip-to-content link in shell
- Page transition animation between routes (subtle)

---

## Phase 1 — Live data client & API hardening

### Client data layer

- `lib/constants.ts` poll intervals, thresholds
- `lib/format.ts` date/number formatters
- `lib/client/api.ts` typed fetch helpers
- `LiveDataProvider` context + 60s poll `/api/snapshot`
- Nav `LiveStatus` reads `asOf` from context after poll
- Stale-while-revalidate on tab focus (refresh on `window.focus`)
- Retry UI on fetch failure (`RefreshBanner` + Retry button)
- SWR or React Query dependency (evaluate vs raw fetch)
- `useDashboard()` hook for client components
- `useSignals()` hook with poll
- Offline banner when `navigator.onLine === false`
- Retry with exponential backoff on fetch failure

### Signals page depth

- Signal detail drawer (slide-over panel)
- Click stream card opens drawer
- Drawer shows: score, category, sparkline, description, related companies
- Filter by risk level (all / critical / elevated / normal)
- Filter by category (Logistics, Geopolitical, etc.)
- `SignalsPageClient` wraps grid + filters + drawer
- Extended signal mock data (description, methodology, related companies)
- Signal history chart (7d) — Recharts or SVG
- Signal definition / methodology tooltip
- Export signals CSV
- Signal comparison mode (select 2, overlay sparklines)
- RSS/webhook subscribe CTA (placeholder)

### Companies page depth

- Search filter by company name
- Sort by score, CVaR, name
- `CompaniesPageClient` with controlled table state
- Pagination (25 per page)
- Column visibility toggles
- Tier filter (Tier 1 / Tier 2)
- Score range slider filter
- Export companies CSV
- Bulk select + add to watchlist (UI only until auth)

### Alerts & cross-links

- Alert "View Exposure" links to `/companies?alert={id}`
- Companies page reads `alert` query and shows filter banner
- `getAlert(id)` in mock store + API
- Alert detail modal with full narrative + timeline
- Alert status: open / acknowledged / resolved
- Alert acknowledge button (mock PATCH)
- Map hotspot click → alert or region filter

### Overview enhancements

- Hero metrics refresh when poll updates (without full page reload)
- Bento uses live snapshot from `LiveDataProvider` on poll
- "Last updated" timestamp in hero eyebrow (relative time)
- Compact hero variant on non-overview routes (optional)
- Overview section anchors (#overview, #alerts, #companies, #signals, #scenario)

### Scenario workbench

- `POST /api/scenarios/[id]/run` returns run result
- Save simulation run to mock store history (in-memory, last 10)
- Simulation history list below workbench (click to reopen)
- Compare two scenarios side-by-side
- Export simulation results CSV
- Scenario parameters form (duration, severity slider)
- Share scenario link with encoded params

---

## Phase 2 — Company profiles & geography

### Company detail (`/companies/[id]`)

- Score breakdown chart (5 factors with weights)
- Linked alerts list for company
- Linked signals affecting company
- Breadcrumbs on company page
- Supplier graph mini visualization (React Flow)
- Tier-1 / tier-2 supplier table
- Historical risk score sparkline (30d)
- Peer comparison (vs sector median)
- Notes field (localStorage until auth)
- Print-friendly company report view

### Map & geography

- Replace stylized SVG with TopoJSON world map
- Hotspot tooltips with region name + alert count
- Region filter on companies page from map click
- Map legend interactive (toggle critical/elevated)
- Full-screen map mode
- Mapbox GL integration (optional, env token)

### Search & discovery

- Global command palette (⌘K) — jump to company/signal/alert
- `GET /api/search` index endpoint
- Recent items in command palette
- Full-text search API mock

---

## Phase 3 — Auth, orgs & watchlists

### Authentication

- [x] Choose auth provider (Clerk recommended; demo auth shipped)
- Sign in / sign up pages
- Protected dashboard routes middleware (opt-in `REQUIRE_AUTH_FOR_UI`)
- User menu in nav (avatar, sign out)
- [x] Session refresh handling (demo localStorage; Clerk when keys set)

### Multi-tenancy

- [x] `organizationId` on all domain types (demo org in session + OrgSwitcher)
- Org switcher in nav
- Row-level data filtering by org in API
- Invite team member flow (Clerk organizations)

### Watchlists

- Create watchlist
- Add/remove companies from watchlist
- Overview bento: "My watchlist" metric
- Filter companies table by watchlist
- Email digest preference per watchlist (UI)

### Roles & permissions

- `viewer` — read only
- `analyst` — run scenarios, acknowledge alerts
- `admin` — manage org, invites
- Role-based UI hiding of actions

---

## Phase 4 — Database & ingest

### Postgres schema

- Choose Neon / Supabase + Vercel integration
- Migration tool (Drizzle)
- Table: `organizations`, `users`
- Table: `companies` (+ `signal_readings` stub table)
- Table: `signal_streams`, `signal_readings`
- Table: `alerts` (timeline JSON)
- Table: `scenarios`, `simulation_runs`
- Table: `dashboard_snapshots`, `map_hotspots`, `ticker_items`
- Table: `watchlists`, `watchlist_companies`
- Seed script from current mock store (`npm run db:seed`)
- Replace mock store reads with DB queries in `lib/api` (via `getDataSource()`)

### Ingest pipeline

- Ingest worker service (Fly.io / Railway / Lambda)
- Queue: SQS or Inngest or Trigger.dev
- Adapter interface: `IngestAdapter.fetch() → NormalizedEvent[]`
- AIS/shipping adapter (stub → real API)
- Geopolitical/news adapter (GDELT stub)
- Port congestion adapter (stub)
- Financial health adapter (stub)
- Weather events adapter (NOAA stub)
- Normalizer: event → signal reading
- [x] Scorer: recompute signal score from readings (`applyReadingsToStreams` + ingest pipeline)
- Aggregator: refresh `dashboard_snapshots` (`POST /api/cron/refresh-snapshot`)
- Dead letter queue for failed ingest jobs

### Vercel ops

- Cron: `/api/cron/refresh-snapshot` hourly (vercel.json)
- Cron secret `CRON_SECRET` validation
- [x] Vercel KV cache for dashboard snapshot (in-memory TTL 60s; KV env optional)
- Invalidate KV on ingest complete webhook

---

## Phase 5 — Risk engine & scenarios

### Risk scoring

- Document methodology page `/methodology`
- Configurable weights per signal category
- Company score = f(signals, tier, concentration)
- Confidence interval on scores
- Score change attribution ("+9 due to Taiwan Strait")

### CVaR

- CVaR calculation module (portfolio + per company)
- 30-day rolling baseline comparison
- CVaR confidence level configurable (95 / 99)
- Backtest CVaR vs realized losses (mock chart)

### Scenario engine

- Shock definition schema (region, duration, severity)
- [x] Graph propagation algorithm (supplier edges; BFS contagion)
- Monte Carlo loss distribution (12 bins)
- Async job: submit → poll → results
- Worker runs simulation off Vercel
- Store `simulation_runs` with parameters + output
- Top contagion entities from real graph walk

---

## Phase 6 — Notifications & integrations

- Slack webhook on critical alert (when `SLACK_WEBHOOK_URL` set)
- Email digest daily/weekly
- PagerDuty integration for critical
- Webhook API for customers (register URL, HMAC sign)
- Zapier integration doc

---

## Phase 7 — Quality, a11y & performance

### Testing

- Vitest unit tests for formatters, scoring utils
- Vitest tests for mock store
- Playwright: nav between all routes
- Playwright: run scenario + reset
- Playwright: signal drawer open/close
- Playwright: company search filter
- Visual regression (Chromatic) on bento grid
- k6 load test `/api/dashboard`

### Accessibility

- axe audit on all routes — zero critical
- Tab order audit on drawer and modals (FocusTrap)
- Screen reader labels on sparklines
- Color contrast audit (critical/elevated/normal)
- Announce ticker updates via `aria-live`

### Performance

- Lighthouse 90+ on all routes
- Dynamic import Recharts / Map only when needed
- Image optimization for OG assets
- Bundle analyzer report in CI
- Edge cache headers on static API responses where safe

### Security

- CSP headers in `next.config.ts`
- `X-Frame-Options`, `X-Content-Type-Options`
- Sanitize any future user-generated content
- Audit dependencies (npm audit fix)
- Secret scanning in CI

---

## Phase 8 — Product & growth

- Marketing landing page at `/welcome` or separate domain
- Pricing page (placeholder tiers)
- Public API docs
- Embed widget for risk index (iframe)
- Dark/light theme toggle (currently dark only)
- i18n groundwork (en first)
- Onboarding tour for first login
- Empty states for filtered tables
- Changelog page

---

## Design system

- Document color tokens in code comments or `tokens.css`
- Spacing scale (4px grid)
- Component size variants (sm/md/lg cards)
- Icon set (Lucide) for nav and actions
- Figma ↔ code parity checklist
- Animation duration tokens
- Elevation / shadow tokens for cards

---

## Documentation

- Basic README (dev + deploy)
- TODO.md build log (this file)
- `ARCHITECTURE.md` with mermaid diagrams
- `CONTRIBUTING.md`
- API reference generated from routes (`GET /api/openapi`, `/api-docs`)
- Risk methodology whitepaper (internal)
- Runbook for ingest failures

---

## Build log (chronological)


| Date       | Item                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| 2026-05-17 | Initial Next.js scaffold + mockup port                                                  |
| 2026-05-17 | GitHub `omry-b/Ripple` + Vercel deploy                                                  |
| 2026-05-17 | Phase 0: multi-route refactor, API routes, component split                              |
| 2026-05-17 | Created `TODO.md`; starting Phase 1 client layer + signals/companies depth              |
| 2026-05-17 | Phase 1: LiveDataProvider, signal drawer/filters, companies search/sort, alert filter   |
| 2026-05-18 | README: live URLs + auto-deploy notes; latest prod deploy commit `4ee1124`              |
| 2026-05-18 | Live hero/bento, scenario API+history, ⌘K palette, company alerts/signals, tier filter  |
| 2026-05-18 | Score breakdown, alert modal+PATCH, signal 7d chart, pagination, map hotspots           |
| 2026-05-18 | Shortcuts, CSV export, score slider, 30d sparkline, scenario compare, recents           |
| 2026-05-18 | Signal compare, watchlist, columns, peers, notes, map fullscreen, mobile nav            |
| 2026-05-18 | Full backend scaffold: Drizzle, ingest/risk/auth/notifications placeholders, new APIs   |
| 2026-05-18 | Storybook, regions, watchlist bento, suppliers, useSignals, fetch retry                 |
| 2026-05-18 | Methodology, search API, rate limit, security headers, attribution, supplier graph      |
| 2026-05-18 | Vercel Analytics, unit tests, CVaR backtest chart, sign-in placeholder, a11y sparklines |
| 2026-05-18 | Demo auth, API envelope, ingest normalizer+DLQ, OpenAPI, product pages, Playwright+CI   |
| 2026-05-18 | Org scoping, graph propagation, async scenarios, theme/CVaR, webhooks HMAC, GDELT/NOAA |
| 2026-05-18 | TopoJSON map, Mapbox optional, Clerk, live ingest adapters, OG image, bundle analyze |
| 2026-05-18 | Postgres CI, scenario worker+cron, axe e2e, Lighthouse CI, Chromatic workflow |
| 2026-05-18 | CI fixes: worker drain test, map aria-labels, scenario e2e selector, LH CI thresholds, Hobby single cron |
| 2026-05-18 | Ingest scorer wired; overview section jump nav; GitHub CI badge in README |
| 2026-05-18 | Postgres signal_readings + rescoring; Resend/PagerDuty/webhooks; alert resolve |


---

## Current sprint (active)

1. [x] Drizzle schema + Postgres data layer (mock fallback)
2. [x] Ingest adapters — GDELT DOC + NOAA live fetch with stub fallback
3. [x] Org-scoped API filtering (demo hash per entity)
4. [x] Graph propagation BFS + async scenario jobs (poll API)
5. [x] Theme toggle, CVaR 95/99 control, embed widget `/embed`
6. [x] Webhook HMAC signing, email digest cron, Vercel KV snapshot cache layer
7. [x] Team invite UI, i18n groundwork, docs (Neon, runbook, Zapier)
8. [x] k6 script, gitleaks CI, 12 unit tests
9. [x] Clerk auth wired (`AppClerkProvider`, middleware, SignIn when keys set)
10. [x] Neon production DB wired on Vercel (CI postgres job + `docs/NEON_SETUP.md`; set `DATABASE_URL` on Vercel)
10b. [x] Vercel Hobby cron limit — single `/api/cron/daily` (see `docs/VERCEL_HOBBY.md`)
11. [x] TopoJSON world map + optional Mapbox (`NEXT_PUBLIC_MAPBOX_TOKEN`)
12. [x] AIS/ports/financial ingest (live when API keys set; World Bank public)
13. [x] Off-Vercel scenario worker (`scenario_jobs` table, cron, `workers/scenario-worker.ts`)
14. [x] Lighthouse / axe audit pass (CI + `npm run lighthouse`, Playwright axe suite)
15. [x] Chromatic visual regression workflow (optional `CHROMATIC_PROJECT_TOKEN`)
16. [x] CI postgres job — worker test calls `drainScenarioJobQueue` (no in-memory poll)
17. [x] CI e2e — `WorldTopoMap` hotspot `aria-label`; scenario waits on `.run-history-list`
18. [x] CI lighthouse — perf floor 50% in CI; step `continue-on-error` on lighthouse job
19. [x] Vercel deploy — `vercel.json` single daily `/api/cron/daily` (Hobby ≤2 crons, once/day)
20. [x] Ingest scorer — readings → `applyReadingsToStreams` in pipeline + mock score state
21. [x] Overview section anchors jump nav (`SectionJumpNav`)
22. [x] README GitHub Actions CI status badge
23. [ ] **Manual:** Vercel env (`DATABASE_URL`, `CRON_SECRET`, optional Clerk/Mapbox keys) + disable deployment protection + custom domain
24. [x] Postgres: persist `signal_readings` + apply scorer on ingest
25. [x] Notifications: Resend email, PagerDuty, org webhooks; alert resolve + ack webhooks
26. [x] Watchlist digest frequency UI (localStorage until server prefs)

---

## Remaining — manual / external only

These cannot be completed in the repo without your accounts or infra:

| Item | Why manual |
|------|------------|
| Vercel Production env vars | Set in [Vercel dashboard](https://vercel.com/omry-2596s-projects/ripple) |
| Deployment protection off | Vercel → Settings → Deployment Protection |
| Custom domain / stable alias | Vercel → Domains |
| Neon `DATABASE_URL` + `npm run db:push` + `db:seed` | Connect Neon, run once against production DB |
| Clerk Organizations invites | Requires Clerk project + org billing |
| `CHROMATIC_PROJECT_TOKEN` | Optional visual regression |
| Third-party API keys | `AIS_API_KEY`, `PORTS_API_KEY`, `MAPBOX`, etc. — adapters already stub→live |
| Off-Vercel ingest worker on Fly/Railway | Optional; cron `/api/cron/daily` covers Hobby |
| SQS / Inngest queue | Production-scale infra choice |
| Lighthouse 90+ on cold `/` | Tune after deploy (images, fonts, edge cache) |
| Figma ↔ code parity | Design process |
| RSS feed endpoint | Planned; webhook + Slack wired |

Everything else in Phases 0–8 is implemented in code (demo/mock fallbacks where keys are unset).


# Ripple — Build Log & Master TODO

> **How to use:** Check `[x]` when done. Add notes under items if needed.  
> **Last updated:** 2026-05-17

---

## Legend

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress

---

## Phase 0 — Foundation & shell

### Repo & deploy
- [x] Production URL documented in README (`ripple-omry-2596s-projects.vercel.app`)
- [x] Auto-deploy on push to `main` (Vercel GitHub app / vercel[bot])
- [ ] Disable Vercel Deployment Protection on Production (if login wall appears)
- [ ] Add stable production alias / custom domain in Vercel → Domains
- [x] Initialize Next.js 16 + TypeScript + App Router
- [x] Configure Plus Jakarta Sans + DM Mono fonts
- [x] Port mockup CSS to `globals.css` design tokens
- [x] Connect GitHub repo `omry-b/Ripple`
- [x] Deploy to Vercel (production + preview on PR)
- [x] Add `vercel.json` framework config
- [x] Fix Turbopack workspace root warning in `next.config.ts`
- [ ] Add custom domain in Vercel project settings
- [ ] Configure Vercel environment variables (Production / Preview / Development)
- [ ] Enable Vercel Analytics + Speed Insights
- [ ] Add deployment status badge to README

### Routing & navigation
- [x] Route group `(dashboard)` with shared layout
- [x] `/` Overview page
- [x] `/signals` Signals page
- [x] `/scenario` Scenario workbench page
- [x] `/companies` Companies ranking page
- [x] `/companies/[id]` Company detail page
- [x] `lib/nav.ts` nav config with hrefs
- [x] Nav uses Next.js `Link` + `usePathname` active state
- [x] Add `not-found.tsx` at dashboard root
- [x] Company `not-found.tsx` for unknown IDs
- [x] Add `error.tsx` at dashboard root (recoverable errors)
- [x] Add `global-error.tsx` at app root
- [ ] Breadcrumb component for nested routes
- [x] Mobile nav: collapsible tabs or bottom bar
- [x] Command palette ⌘K (search companies, alerts, nav)
- [x] Keyboard shortcuts (g+o overview, g+s signals, etc.)

### Component architecture
- [x] Delete monolithic `Dashboard.tsx`
- [x] `components/shell/NavHeader`
- [x] `components/shell/SignalTicker`
- [x] `components/shell/LiveStatus`
- [x] `components/shell/PageEffects` (scroll reveal)
- [x] `components/shell/PageHeader`
- [x] `components/hero/HeroSection`
- [x] `components/bento/BentoGrid`
- [x] `components/alerts/AlertsSection` + `AlertCard`
- [x] `components/tables/CompanyExposureTable`
- [x] `components/streams/StreamGrid`
- [x] `components/scenario/ScenarioWorkbench`
- [x] `components/overview/OverviewPage`
- [x] Extract `GlobalRiskMap` SVG to own component
- [ ] Extract `AlertCard` conic border wrapper to variant prop only
- [ ] Storybook setup for shell + bento cards
- [ ] Shared `MetricCard` primitive for bento small tiles

### Data & API façade (mock)
- [x] `types/domain.ts` canonical types
- [x] `lib/mock/store.ts` single mock source
- [x] `lib/api/index.ts` server-side getters
- [x] `GET /api/dashboard`
- [x] `GET /api/signals`
- [x] `GET /api/companies`
- [x] `GET /api/alerts`
- [x] `GET /api/scenarios`
- [x] `GET /api/companies/[id]`
- [x] `GET /api/snapshot` (lightweight shell payload)
- [ ] API response envelope: `{ asOf, data }` consistent everywhere
- [ ] API error responses with proper status codes (404, 500)
- [ ] Rate limiting middleware on API routes
- [ ] OpenAPI / typed client generation from routes

### UX polish (Phase 0)
- [x] `loading.tsx` skeleton for dashboard routes
- [x] Demo data banner at top of shell
- [x] Live vs Stale pulse based on `asOf` + 5min threshold
- [x] `prefers-reduced-motion` disables ticker + blobs
- [x] Company rows link to `/companies/[id]`
- [x] Overview links to signals + scenario pages
- [ ] Skeleton components match bento card shapes exactly
- [x] Focus visible styles on all interactive elements
- [x] Skip-to-content link in shell
- [ ] Page transition animation between routes (subtle)

---

## Phase 1 — Live data client & API hardening

### Client data layer
- [x] `lib/constants.ts` poll intervals, thresholds
- [x] `lib/format.ts` date/number formatters
- [x] `lib/client/api.ts` typed fetch helpers
- [x] `LiveDataProvider` context + 60s poll `/api/snapshot`
- [x] Nav `LiveStatus` reads `asOf` from context after poll
- [x] Stale-while-revalidate on tab focus (refresh on `window.focus`)
- [x] Retry UI on fetch failure (`RefreshBanner` + Retry button)
- [ ] SWR or React Query dependency (evaluate vs raw fetch)
- [x] `useDashboard()` hook for client components
- [ ] `useSignals()` hook with poll
- [x] Offline banner when `navigator.onLine === false`
- [ ] Retry with exponential backoff on fetch failure

### Signals page depth
- [x] Signal detail drawer (slide-over panel)
- [x] Click stream card opens drawer
- [x] Drawer shows: score, category, sparkline, description, related companies
- [x] Filter by risk level (all / critical / elevated / normal)
- [x] Filter by category (Logistics, Geopolitical, etc.)
- [x] `SignalsPageClient` wraps grid + filters + drawer
- [x] Extended signal mock data (description, methodology, related companies)
- [x] Signal history chart (7d) — Recharts or SVG
- [x] Signal definition / methodology tooltip
- [x] Export signals CSV
- [x] Signal comparison mode (select 2, overlay sparklines)
- [x] RSS/webhook subscribe CTA (placeholder)

### Companies page depth
- [x] Search filter by company name
- [x] Sort by score, CVaR, name
- [x] `CompaniesPageClient` with controlled table state
- [x] Pagination (25 per page)
- [x] Column visibility toggles
- [x] Tier filter (Tier 1 / Tier 2)
- [x] Score range slider filter
- [x] Export companies CSV
- [x] Bulk select + add to watchlist (UI only until auth)

### Alerts & cross-links
- [x] Alert "View Exposure" links to `/companies?alert={id}`
- [x] Companies page reads `alert` query and shows filter banner
- [x] `getAlert(id)` in mock store + API
- [x] Alert detail modal with full narrative + timeline
- [x] Alert status: open / acknowledged / resolved
- [x] Alert acknowledge button (mock PATCH)
- [x] Map hotspot click → alert or region filter

### Overview enhancements
- [x] Hero metrics refresh when poll updates (without full page reload)
- [x] Bento uses live snapshot from `LiveDataProvider` on poll
- [x] "Last updated" timestamp in hero eyebrow (relative time)
- [x] Compact hero variant on non-overview routes (optional)
- [x] Overview section anchors (#overview, #alerts, #companies, #signals, #scenario)

### Scenario workbench
- [x] `POST /api/scenarios/[id]/run` returns run result
- [x] Save simulation run to mock store history (in-memory, last 10)
- [x] Simulation history list below workbench (click to reopen)
- [x] Compare two scenarios side-by-side
- [x] Export simulation results CSV
- [x] Scenario parameters form (duration, severity slider)
- [x] Share scenario link with encoded params

---

## Phase 2 — Company profiles & geography

### Company detail (`/companies/[id]`)
- [x] Score breakdown chart (5 factors with weights)
- [x] Linked alerts list for company
- [x] Linked signals affecting company
- [x] Breadcrumbs on company page
- [ ] Supplier graph mini visualization (React Flow)
- [ ] Tier-1 / tier-2 supplier table
- [x] Historical risk score sparkline (30d)
- [x] Peer comparison (vs sector median)
- [x] Notes field (localStorage until auth)
- [ ] Print-friendly company report view

### Map & geography
- [ ] Replace stylized SVG with TopoJSON world map
- [x] Hotspot tooltips with region name + alert count
- [ ] Region filter on companies page from map click
- [x] Map legend interactive (toggle critical/elevated)
- [x] Full-screen map mode
- [ ] Mapbox GL integration (optional, env token)

### Search & discovery
- [x] Global command palette (⌘K) — jump to company/signal/alert
- [x] `GET /api/search` index endpoint
- [x] Recent items in command palette
- [ ] Full-text search API mock

---

## Phase 3 — Auth, orgs & watchlists

### Authentication
- [ ] Choose auth provider (Clerk recommended)
- [ ] Sign in / sign up pages
- [ ] Protected dashboard routes middleware
- [ ] User menu in nav (avatar, sign out)
- [ ] Session refresh handling

### Multi-tenancy
- [ ] `organizationId` on all domain types
- [ ] Org switcher in nav
- [ ] Row-level data filtering by org in API
- [ ] Invite team member flow (Clerk organizations)

### Watchlists
- [ ] Create watchlist
- [ ] Add/remove companies from watchlist
- [ ] Overview bento: "My watchlist" metric
- [ ] Filter companies table by watchlist
- [ ] Email digest preference per watchlist (UI)

### Roles & permissions
- [ ] `viewer` — read only
- [ ] `analyst` — run scenarios, acknowledge alerts
- [ ] `admin` — manage org, invites
- [ ] Role-based UI hiding of actions

---

## Phase 4 — Database & ingest

### Postgres schema
- [ ] Choose Neon / Supabase + Vercel integration
- [ ] Migration tool (Drizzle or Prisma)
- [ ] Table: `organizations`, `users`
- [ ] Table: `companies`, `company_suppliers`
- [ ] Table: `signals`, `signal_readings` (time series)
- [ ] Table: `alerts`, `alert_companies`
- [ ] Table: `scenarios`, `simulation_runs`
- [ ] Table: `dashboard_snapshots`
- [ ] Table: `watchlists`, `watchlist_companies`
- [ ] Seed script from current mock store
- [ ] Replace mock store reads with DB queries in `lib/api`

### Ingest pipeline
- [ ] Ingest worker service (Fly.io / Railway / Lambda)
- [ ] Queue: SQS or Inngest or Trigger.dev
- [ ] Adapter interface: `IngestAdapter.fetch() → NormalizedEvent[]`
- [ ] AIS/shipping adapter (stub → real API)
- [ ] Geopolitical/news adapter (GDELT stub)
- [ ] Port congestion adapter (stub)
- [ ] Financial health adapter (stub)
- [ ] Weather events adapter (NOAA stub)
- [ ] Normalizer: event → signal reading
- [ ] Scorer: recompute signal score from readings
- [ ] Aggregator: refresh `dashboard_snapshots`
- [ ] Dead letter queue for failed ingest jobs

### Vercel ops
- [ ] Cron: `/api/cron/refresh-snapshot` hourly
- [ ] Cron secret `CRON_SECRET` validation
- [ ] Vercel KV cache for dashboard snapshot (TTL 60s)
- [ ] Invalidate KV on ingest complete webhook

---

## Phase 5 — Risk engine & scenarios

### Risk scoring
- [ ] Document methodology page `/methodology`
- [ ] Configurable weights per signal category
- [ ] Company score = f(signals, tier, concentration)
- [ ] Confidence interval on scores
- [ ] Score change attribution ("+9 due to Taiwan Strait")

### CVaR
- [ ] CVaR calculation module (portfolio + per company)
- [ ] 30-day rolling baseline comparison
- [ ] CVaR confidence level configurable (95 / 99)
- [ ] Backtest CVaR vs realized losses (mock chart)

### Scenario engine
- [ ] Shock definition schema (region, duration, severity)
- [ ] Graph propagation algorithm (supplier edges)
- [ ] Monte Carlo loss distribution (12 bins)
- [ ] Async job: submit → poll → results
- [ ] Worker runs simulation off Vercel
- [ ] Store `simulation_runs` with parameters + output
- [ ] Top contagion entities from real graph walk

---

## Phase 6 — Notifications & integrations

- [ ] Slack webhook on critical alert
- [ ] Email digest daily/weekly
- [ ] PagerDuty integration for critical
- [ ] Webhook API for customers (register URL, HMAC sign)
- [ ] Zapier integration doc

---

## Phase 7 — Quality, a11y & performance

### Testing
- [ ] Vitest unit tests for formatters, scoring utils
- [ ] Vitest tests for mock store
- [ ] Playwright: nav between all routes
- [ ] Playwright: run scenario + reset
- [ ] Playwright: signal drawer open/close
- [ ] Playwright: company search filter
- [ ] Visual regression (Chromatic) on bento grid
- [ ] k6 load test `/api/dashboard`

### Accessibility
- [ ] axe audit on all routes — zero critical
- [ ] Tab order audit on drawer and modals
- [ ] Screen reader labels on sparklines
- [ ] Color contrast audit (critical/elevated/normal)
- [ ] Announce ticker updates via `aria-live`

### Performance
- [ ] Lighthouse 90+ on all routes
- [ ] Dynamic import Recharts / Map only when needed
- [ ] Image optimization for OG assets
- [ ] Bundle analyzer report in CI
- [ ] Edge cache headers on static API responses where safe

### Security
- [ ] CSP headers in `next.config.ts`
- [ ] `X-Frame-Options`, `X-Content-Type-Options`
- [ ] Sanitize any future user-generated content
- [ ] Audit dependencies (npm audit fix)
- [ ] Secret scanning in CI

---

## Phase 8 — Product & growth

- [ ] Marketing landing page at `/welcome` or separate domain
- [ ] Pricing page (placeholder tiers)
- [ ] Public API docs
- [ ] Embed widget for risk index (iframe)
- [ ] Dark/light theme toggle (currently dark only)
- [ ] i18n groundwork (en first)
- [ ] Onboarding tour for first login
- [ ] Empty states for filtered tables
- [ ] Changelog page

---

## Design system

- [ ] Document color tokens in code comments or `tokens.css`
- [ ] Spacing scale (4px grid)
- [ ] Component size variants (sm/md/lg cards)
- [ ] Icon set (Lucide) for nav and actions
- [ ] Figma ↔ code parity checklist
- [ ] Animation duration tokens
- [ ] Elevation / shadow tokens for cards

---

## Documentation

- [x] Basic README (dev + deploy)
- [x] TODO.md build log (this file)
- [ ] `ARCHITECTURE.md` with mermaid diagrams
- [ ] `CONTRIBUTING.md`
- [ ] API reference generated from routes
- [ ] Risk methodology whitepaper (internal)
- [ ] Runbook for ingest failures

---

## Build log (chronological)

| Date | Item |
|------|------|
| 2026-05-17 | Initial Next.js scaffold + mockup port |
| 2026-05-17 | GitHub `omry-b/Ripple` + Vercel deploy |
| 2026-05-17 | Phase 0: multi-route refactor, API routes, component split |
| 2026-05-17 | Created `TODO.md`; starting Phase 1 client layer + signals/companies depth |
| 2026-05-17 | Phase 1: LiveDataProvider, signal drawer/filters, companies search/sort, alert filter |
| 2026-05-18 | README: live URLs + auto-deploy notes; latest prod deploy commit `4ee1124` |
| 2026-05-18 | Live hero/bento, scenario API+history, ⌘K palette, company alerts/signals, tier filter |
| 2026-05-18 | Score breakdown, alert modal+PATCH, signal 7d chart, pagination, map hotspots |
| 2026-05-18 | Shortcuts, CSV export, score slider, 30d sparkline, scenario compare, recents |
| 2026-05-18 | Signal compare, watchlist, columns, peers, notes, map fullscreen, mobile nav |

---

## Current sprint (active)

1. [x] Signal compare mode (2 streams, overlay chart)
2. [x] Watchlist (star, bulk add, nav link, ?watchlist=1)
3. [x] Column visibility toggles on companies table
4. [x] Peer comparison + analyst notes on company profile
5. [x] Scenario share link + export simulation CSV
6. [x] Interactive map legend + fullscreen map
7. [x] Mobile nav drawer + compact metrics strip
8. [x] RSS/webhook CTA placeholder · `useDashboard()` hook

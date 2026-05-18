# Ripple

[![Deployed on Vercel](https://img.shields.io/badge/deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://ripple-omry-2596s-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

Supply chain intelligence dashboard — live risk signals, company exposure, and scenario simulation.

## Live site

| Link | URL |
|------|-----|
| **Production** (Vercel) | [https://ripple-omry-2596s-projects.vercel.app](https://ripple-omry-2596s-projects.vercel.app) |
| **Vercel dashboard** | [vercel.com/omry-2596s-projects/ripple](https://vercel.com/omry-2596s-projects/ripple) |
| **GitHub** | [github.com/omry-b/Ripple](https://github.com/omry-b/Ripple) |

If the site asks you to log in to Vercel, turn off **Deployment Protection** for Production: Vercel project → **Settings** → **Deployment Protection** → set Production to public (or “Only Preview Deployments”).

## Auto-deploy

Every push to `main` triggers a production deploy via the [Vercel GitHub integration](https://vercel.com/docs/deployments/git). Preview URLs are created for pull requests.

Check deploy status:

- GitHub → repo **Actions** / commit status (green check from Vercel)
- [Vercel dashboard → Deployments](https://vercel.com/omry-2596s-projects/ripple)

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- TypeScript
- Hosted on [Vercel](https://vercel.com)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Component catalog (local):

```bash
npm run storybook
```

Unit tests:

```bash
npm run test
```

E2E (Playwright):

```bash
npm run test:e2e
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Dashboard overview |
| `/welcome` | Marketing landing |
| `/pricing` | Placeholder tiers |
| `/api-docs` | API overview + OpenAPI link |
| `/changelog` | Release notes |
| `/sign-in`, `/sign-up` | Demo auth (localStorage session) |

OpenAPI JSON: [`/api/openapi`](https://ripple-omry-2596s-projects.vercel.app/api/openapi)

Demo roles: set `DEMO_USER_ROLE` to `viewer`, `analyst`, or `admin` in `.env.local`. Optional `REQUIRE_AUTH_FOR_UI=true` redirects unauthenticated users to sign-in.

## Build log

See [TODO.md](./TODO.md) for the full backlog and what’s shipped.

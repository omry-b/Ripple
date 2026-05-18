# Vercel Hobby plan notes

The Hobby plan limits **cron jobs to 2** and runs them **once per day** (not hourly).

Ripple ships **one** combined cron: `GET /api/cron/daily` at 12:00 UTC, which:

1. Refreshes the dashboard snapshot  
2. Sends the daily digest email (if `RESEND_API_KEY` is set)  
3. Drains queued scenario jobs  

Individual routes remain available for manual calls:

- `/api/cron/refresh-snapshot`
- `/api/cron/digest`
- `/api/cron/scenario-worker`

On **Pro**, add more crons in the Vercel dashboard (e.g. hourly snapshot, scenario worker every 5 minutes).

Set `CRON_SECRET` in Vercel → Environment Variables and pass `Authorization: Bearer <secret>`.

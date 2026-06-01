import Link from "next/link";
import { MarketingShell } from "@/components/shell/MarketingShell";

const ENTRIES = [
  { date: "2026-05-28", title: "Visual overhaul, dynamic dashboard polling, Cloudflare + Postgres production stack" },
  { date: "2026-05-18", title: "Auth roles, ingest normalizer, API envelope, E2E tests" },
  { date: "2026-05-18", title: "Storybook, methodology, watchlists, region filters" },
  { date: "2026-05-18", title: "Drizzle backend scaffold + ingest placeholders" },
  { date: "2026-05-17", title: "Multi-route dashboard, live polling, scenario API" },
];

export const metadata = { title: "Changelog  -  Ripple" };

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <main className="welcome-page changelog-page">
        <p className="welcome-eyebrow">Release notes</p>
        <h1 className="welcome-headline">Changelog</h1>
        <p className="welcome-lead">What shipped recently in the Ripple dashboard and platform.</p>
        <ul className="changelog-timeline">
          {ENTRIES.map((e) => (
            <li key={e.date + e.title}>
              <time dateTime={e.date}>{e.date}</time>
              <span>{e.title}</span>
            </li>
          ))}
        </ul>
        <Link href="/" className="welcome-cta-primary">
          Open dashboard →
        </Link>
      </main>
    </MarketingShell>
  );
}

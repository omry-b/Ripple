import Link from "next/link";

const ENTRIES = [
  { date: "2026-05-18", title: "Auth roles, ingest normalizer, API envelope, E2E tests" },
  { date: "2026-05-18", title: "Storybook, methodology, watchlists, region filters" },
  { date: "2026-05-18", title: "Drizzle backend scaffold + ingest placeholders" },
  { date: "2026-05-17", title: "Multi-route dashboard, live polling, scenario API" },
];

export const metadata = { title: "Changelog — Ripple" };

export default function ChangelogPage() {
  return (
    <main className="welcome-page">
      <h1>Changelog</h1>
      <ul className="changelog-list">
        {ENTRIES.map((e) => (
          <li key={e.title}>
            <time>{e.date}</time>
            <span>{e.title}</span>
          </li>
        ))}
      </ul>
      <Link href="/" className="welcome-cta-secondary">
        Dashboard →
      </Link>
    </main>
  );
}

import Link from "next/link";

export const metadata = { title: "API docs — Ripple" };

export default function ApiDocsPage() {
  return (
    <main className="welcome-page">
      <h1>API reference</h1>
      <p className="welcome-lead">
        OpenAPI stub for integrators. All responses use <code>{`{ asOf, data }`}</code> envelope
        where noted.
      </p>
      <ul className="api-docs-links">
        <li>
          <a href="/api/openapi" target="_blank" rel="noreferrer">
            GET /api/openapi
          </a>
          — JSON spec
        </li>
        <li>
          <a href="/api/health" target="_blank" rel="noreferrer">
            GET /api/health
          </a>
        </li>
        <li>
          <a href="/api/snapshot" target="_blank" rel="noreferrer">
            GET /api/snapshot
          </a>
        </li>
      </ul>
      <Link href="/methodology" className="welcome-cta-secondary">
        Methodology →
      </Link>
    </main>
  );
}

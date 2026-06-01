import Link from "next/link";
import { MarketingShell } from "@/components/shell/MarketingShell";

const ENDPOINTS = [
  { path: "/api/openapi", desc: "OpenAPI JSON spec" },
  { path: "/api/health", desc: "Liveness + data mode" },
  { path: "/api/dashboard", desc: "Full dashboard payload" },
  { path: "/api/snapshot", desc: "KPI snapshot" },
  { path: "/api/alerts", desc: "Open alerts list" },
  { path: "/api/ingest/internal", desc: "Service-auth ingest (cron)" },
];

export const metadata = { title: "Ripple | API docs" };

export default function ApiDocsPage() {
  return (
    <MarketingShell>
      <main className="welcome-page">
        <p className="welcome-eyebrow">Integrations</p>
        <h1 className="welcome-headline">API reference</h1>
        <p className="welcome-lead">
          REST endpoints for integrators. Most responses use a{" "}
          <code>{`{ asOf, data }`}</code> envelope. Service routes require{" "}
          <code>Authorization: Bearer CRON_SECRET</code>.
        </p>
        <div className="api-endpoint-grid">
          {ENDPOINTS.map((ep) => (
            <a
              key={ep.path}
              href={ep.path}
              target="_blank"
              rel="noreferrer"
              className="api-endpoint-card"
            >
              <span className="api-endpoint-method">GET</span>
              <span className="api-endpoint-path">{ep.path}</span>
              <span className="api-endpoint-desc">{ep.desc}</span>
            </a>
          ))}
        </div>
        <div className="welcome-cta-row">
          <Link href="/methodology" className="welcome-cta-secondary">
            Methodology →
          </Link>
          <Link href="/" className="welcome-cta-primary">
            Dashboard →
          </Link>
        </div>
      </main>
    </MarketingShell>
  );
}

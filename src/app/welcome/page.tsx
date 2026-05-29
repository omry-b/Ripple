import Link from "next/link";
import { MarketingShell } from "@/components/shell/MarketingShell";
import { WelcomeDashboardPreview } from "@/components/marketing/WelcomeDashboardPreview";
import { Radio, ShieldAlert, FlaskConical, LineChart, Zap, Globe2 } from "lucide-react";

export const metadata = {
  title: "Ripple — Supply chain risk intelligence",
  description: "Live exposure, signals, CVaR, and scenario stress for global supply chains.",
};

const FEATURES = [
  {
    icon: Radio,
    title: "Live signal streams",
    body: "AIS, ports, geopolitical, financial, and weather channels scored in real time with ingest on a six-hour edge schedule.",
  },
  {
    icon: ShieldAlert,
    title: "Portfolio CVaR",
    body: "Tail-loss estimates at the 95th percentile with company-level exposure ranking and alert workflows.",
  },
  {
    icon: FlaskConical,
    title: "Scenario engine",
    body: "What-if shocks propagate across supplier tiers — sync or async jobs drained by Cloudflare every five minutes.",
  },
  {
    icon: LineChart,
    title: "Data-dense overview",
    body: "Bento dashboard with global risk map, watchlists, and drill-down company profiles backed by Postgres.",
  },
  {
    icon: Zap,
    title: "Edge + API",
    body: "RSS, webhooks, Slack, and Resend hooks when configured — plus OpenAPI for your stack.",
  },
  {
    icon: Globe2,
    title: "Multi-region",
    body: "APAC, EMEA, and AMER hotspots with contagion hops and supplier graph visualization.",
  },
];

const TRUST = ["Postgres production", "Cloudflare crons", "Vercel edge", "OpenAPI", "WCAG-focused UI"];

export default function WelcomePage() {
  return (
    <MarketingShell>
      <main className="welcome-page">
        <section className="welcome-hero-block">
          <div className="welcome-hero-copy">
            <p className="welcome-eyebrow">Supply chain intelligence</p>
            <h1 className="welcome-headline">
              See risk before it hits your{" "}
              <span className="welcome-headline-accent">P&amp;L</span>
            </h1>
            <p className="welcome-lead">
              Ripple quantifies exposure across your supplier network — live signals, CVaR
              baselines, open alerts, and Monte Carlo scenarios in one operations-grade
              dashboard.
            </p>
            <div className="welcome-cta-row">
              <Link href="/" className="welcome-cta-primary">
                Open live dashboard
              </Link>
              <Link href="/pricing" className="welcome-cta-secondary">
                View pricing
              </Link>
            </div>
            <ul className="welcome-trust-strip" aria-label="Platform highlights">
              {TRUST.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <WelcomeDashboardPreview />
        </section>

        <section className="welcome-features">
          <h2 className="welcome-section-title">Built for risk teams</h2>
          <p className="welcome-section-sub">
            Financial-dashboard UX — dark, data-dense, and designed for decisions under
            uncertainty.
          </p>
          <div className="welcome-feature-grid">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="welcome-feature-card">
                <span className="welcome-feature-icon" aria-hidden>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="welcome-cta-banner">
          <div>
            <h2>Ready to stress-test your supply chain?</h2>
            <p>Start with the live demo — Postgres-backed in production, mock mode locally.</p>
          </div>
          <Link href="/" className="welcome-cta-primary welcome-cta-lg">
            Launch Ripple →
          </Link>
        </section>
      </main>
    </MarketingShell>
  );
}

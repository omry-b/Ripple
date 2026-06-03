import Link from "next/link";
import { MarketingShell } from "@/components/shell/MarketingShell";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    detail: "Demo data · 3 seats · community support",
    features: ["Overview + signals", "Scenario workbench", "CSV export", "Mock data mode"],
    cta: "Open dashboard",
    href: "/",
  },
  {
    name: "Growth",
    price: "$2.4k",
    period: "/ month",
    detail: "Postgres · hourly ingest · Cloudflare crons",
    features: [
      "Everything in Starter",
      "Watchlists + webhooks",
      "Slack & email alerts",
      "Async scenario jobs",
      "RSS + OpenAPI",
    ],
    highlight: true,
    cta: "Start with Growth",
    href: "/sign-in",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    detail: "SSO · dedicated ingest · SLA",
    features: ["Multi-org + Firebase Auth", "Custom risk models", "VPC / on-prem", "Dedicated support"],
    cta: "Contact sales",
    href: "mailto:sales@ripple.example?subject=Ripple%20Enterprise",
    external: true,
  },
];

const FAQ = [
  {
    q: "Can I run without Firebase?",
    a: "Yes. Demo mode uses local watchlists and the full dashboard with mock or Postgres-backed data.",
  },
  {
    q: "Where does live data come from?",
    a: "Ingest adapters (AIS, ports, weather, financial, geopolitical) run on Cloudflare cron and refresh snapshots in Postgres.",
  },
  {
    q: "Is there an API?",
    a: "OpenAPI docs at /api-docs with RSS, webhooks, and scoped org endpoints when configured.",
  },
];

export const metadata = { title: "Pricing — Ripple" };

export default function PricingPage() {
  return (
    <MarketingShell>
      <main className="welcome-page pricing-page">
        <header className="pricing-header">
          <p className="welcome-eyebrow">Transparent tiers</p>
          <h1 className="welcome-headline pricing-headline">Pricing</h1>
          <p className="welcome-lead">
            Start on the live dashboard for free, then scale to Postgres ingest, watchlists, and
            enterprise SSO when your team is ready.
          </p>
        </header>
        <div className="pricing-grid">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`pricing-card${tier.highlight ? " pricing-card-highlight" : ""}`}
            >
              {tier.highlight && <span className="pricing-badge">Most popular</span>}
              <h2 className="pricing-tier-name">{tier.name}</h2>
              <p className="pricing-price">
                {tier.price}
                {tier.period && <span className="pricing-period">{tier.period}</span>}
              </p>
              <p className="pricing-detail">{tier.detail}</p>
              <ul className="pricing-feature-list">
                {tier.features.map((f) => (
                  <li key={f}>
                    <Check size={14} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.external ? (
                <a
                  href={tier.href}
                  className={
                    tier.highlight
                      ? "welcome-cta-primary pricing-cta"
                      : "welcome-cta-secondary pricing-cta"
                  }
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  href={tier.href}
                  className={
                    tier.highlight
                      ? "welcome-cta-primary pricing-cta"
                      : "welcome-cta-secondary pricing-cta"
                  }
                >
                  {tier.cta}
                </Link>
              )}
            </article>
          ))}
        </div>

        <section className="pricing-faq" aria-labelledby="pricing-faq-title">
          <h2 id="pricing-faq-title" className="welcome-section-title">
            FAQ
          </h2>
          <dl className="pricing-faq-list">
            {FAQ.map((item) => (
              <div key={item.q} className="pricing-faq-item">
                <dt className="pricing-faq-q">{item.q}</dt>
                <dd className="pricing-faq-a">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </MarketingShell>
  );
}

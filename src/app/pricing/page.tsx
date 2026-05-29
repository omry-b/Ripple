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
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    detail: "SSO · dedicated ingest · SLA",
    features: ["Multi-org + Clerk", "Custom risk models", "VPC / on-prem", "Dedicated support"],
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
            Placeholder tiers for sales conversations — production runs on Growth stack today.
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
              <Link
                href="/"
                className={tier.highlight ? "welcome-cta-primary pricing-cta" : "welcome-cta-secondary pricing-cta"}
              >
                {tier.name === "Enterprise" ? "Contact sales" : "Get started"}
              </Link>
            </article>
          ))}
        </div>
      </main>
    </MarketingShell>
  );
}

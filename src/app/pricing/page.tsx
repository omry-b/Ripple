import Link from "next/link";

const TIERS = [
  {
    name: "Starter",
    price: "$0",
    detail: "Demo data · 3 seats · community support",
    features: ["Overview + signals", "Scenario workbench", "CSV export"],
  },
  {
    name: "Growth",
    price: "$2.4k",
    detail: "Per month · Postgres · hourly ingest",
    features: ["Everything in Starter", "Watchlists + webhooks", "Slack alerts"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "SSO · dedicated ingest · SLA",
    features: ["Multi-org", "Custom risk models", "VPC / on-prem option"],
  },
];

export const metadata = { title: "Pricing — Ripple" };

export default function PricingPage() {
  return (
    <main className="welcome-page pricing-page">
      <h1>Pricing</h1>
      <p className="welcome-lead">Placeholder tiers for sales conversations.</p>
      <div className="pricing-grid">
        {TIERS.map((tier) => (
          <article
            key={tier.name}
            className={`workbench-card pricing-card${tier.highlight ? " pricing-card-highlight" : ""}`}
          >
            <h2>{tier.name}</h2>
            <p className="pricing-price">{tier.price}</p>
            <p className="pricing-detail">{tier.detail}</p>
            <ul>
              {tier.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <Link href="/" className="welcome-cta-primary">
        Back to dashboard
      </Link>
    </main>
  );
}

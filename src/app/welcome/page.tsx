import Link from "next/link";

export const metadata = {
  title: "Ripple — Supply chain risk intelligence",
};

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <div className="welcome-hero">
        <p className="welcome-eyebrow">Supply chain intelligence</p>
        <h1>See risk before it hits your P&amp;L</h1>
        <p className="welcome-lead">
          Live signals, company exposure, CVaR estimates, and scenario simulation — in one
          operations-grade dashboard.
        </p>
        <div className="welcome-cta-row">
          <Link href="/" className="welcome-cta-primary">
            Open dashboard
          </Link>
          <Link href="/pricing" className="welcome-cta-secondary">
            View pricing
          </Link>
        </div>
      </div>
    </main>
  );
}

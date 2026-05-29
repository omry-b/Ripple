import Link from "next/link";
import type { ReactNode } from "react";

type MarketingShellProps = {
  children: ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="ripple-app marketing-shell">
      <header className="marketing-nav">
        <Link href="/welcome" className="marketing-logo">
          Ripple
        </Link>
        <nav className="marketing-nav-links" aria-label="Marketing">
          <Link href="/welcome">Product</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/" className="marketing-nav-cta">
            Open dashboard
          </Link>
        </nav>
      </header>
      {children}
      <footer className="marketing-footer">
        <span className="marketing-footer-brand">Ripple</span>
        <span className="marketing-footer-copy">
          Supply chain risk intelligence · Postgres + edge crons in production
        </span>
        <div className="marketing-footer-links">
          <Link href="/api-docs">API</Link>
          <Link href="/changelog">Changelog</Link>
          <Link href="/settings/system">System status</Link>
        </div>
      </footer>
    </div>
  );
}

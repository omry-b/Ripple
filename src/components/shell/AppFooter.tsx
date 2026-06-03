import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-brand">Ripple</span>
        <span className="app-footer-meta">Supply chain risk intelligence</span>
        <nav className="app-footer-nav" aria-label="Footer">
          <Link href="/companies">Companies</Link>
          <Link href="/signals">Signals</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/api-docs">API</Link>
          <Link href="/changelog">Changelog</Link>
          <Link href="/settings/system">Status</Link>
          <Link href="/welcome">About</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}

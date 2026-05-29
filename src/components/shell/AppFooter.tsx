import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span className="app-footer-brand">Ripple</span>
        <span className="app-footer-meta">Supply chain risk intelligence</span>
        <nav className="app-footer-nav" aria-label="Footer">
          <Link href="/methodology">Methodology</Link>
          <Link href="/api-docs">API</Link>
          <Link href="/settings/system">Status</Link>
          <Link href="/welcome">About</Link>
        </nav>
      </div>
    </footer>
  );
}

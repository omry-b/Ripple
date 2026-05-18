import { getSnapshot } from "@/lib/api";

export const metadata = {
  title: "Ripple Risk Index — Embed",
  robots: "noindex",
};

export default async function EmbedPage() {
  const snapshot = await getSnapshot();

  return (
    <main className="embed-widget" data-embed>
      <header className="embed-widget-header">
        <span className="embed-widget-brand">Ripple Risk Index</span>
        <span className="embed-widget-asof">{snapshot.asOf.slice(0, 10)}</span>
      </header>
      <div className="embed-widget-metrics">
        <div className="embed-metric">
          <span className="embed-metric-label">Portfolio CVaR</span>
          <strong>{snapshot.cvar95Display}</strong>
        </div>
        <div className="embed-metric">
          <span className="embed-metric-label">Exposed cos.</span>
          <strong>{snapshot.exposedCompanies}</strong>
        </div>
        <div className="embed-metric">
          <span className="embed-metric-label">Active alerts</span>
          <strong>{snapshot.openAlertsCount}</strong>
        </div>
      </div>
      <footer className="embed-widget-footer">
        <a
          href="https://ripple-omry-2596s-projects.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open full dashboard →
        </a>
      </footer>
    </main>
  );
}

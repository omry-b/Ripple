import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { PageHeader } from "@/components/shell/PageHeader";

export const metadata = {
  title: "Methodology — Ripple",
};

const SECTIONS = [
  {
    title: "Risk score (0–100)",
    body: "Composite index from five weighted factors: geopolitical exposure, logistics & shipping, financial distress, supplier concentration, and weather. Weights are configurable per org in production.",
  },
  {
    title: "Signal streams",
    body: "Each stream (AIS, GDELT, ports, financial, weather) produces a 0–100 sub-score refreshed on ingest. Elevated and critical thresholds trigger alerts when portfolio exposure exceeds baselines.",
  },
  {
    title: "CVaR₉₅",
    body: "Conditional Value at Risk at the 95th percentile estimates tail loss for the tracked portfolio. Demo mode uses mock baselines; production runs the module in lib/risk/cvar.ts against live positions.",
  },
  {
    title: "Scenario engine",
    body: "Shocks propagate across supplier tiers with severity and duration parameters. Monte Carlo bins and contagion hops are placeholders until the graph worker is connected.",
  },
];

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        title="Risk methodology"
        subtitle="How Ripple scores exposure in demo and production modes"
      />
      <main className="content-container">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Methodology" },
          ]}
        />
        <div className="methodology-grid">
          {SECTIONS.map((section) => (
            <article key={section.title} className="workbench-card methodology-card">
              <h2 className="methodology-card-title">{section.title}</h2>
              <p className="methodology-card-body">{section.body}</p>
            </article>
          ))}
        </div>
        <p className="methodology-footnote">
          Demo data only. See <code>lib/risk/</code> and <code>lib/ingest/</code> for implementation stubs.
        </p>
      </main>
    </>
  );
}

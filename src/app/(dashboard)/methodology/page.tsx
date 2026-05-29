import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { PageHeader } from "@/components/shell/PageHeader";
import { Gauge, Radio, LineChart, GitBranch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Methodology — Ripple",
};

const SECTIONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Gauge,
    title: "Risk score (0–100)",
    body: "Composite index from five weighted factors: geopolitical exposure, logistics & shipping, financial distress, supplier concentration, and weather. Weights are configurable per org in production.",
  },
  {
    icon: Radio,
    title: "Signal streams",
    body: "Each stream (AIS, GDELT, ports, financial, weather) produces a 0–100 sub-score refreshed on ingest. Elevated and critical thresholds trigger alerts when portfolio exposure exceeds baselines.",
  },
  {
    icon: LineChart,
    title: "CVaR₉₅",
    body: "Conditional Value at Risk at the 95th percentile estimates tail loss for the tracked portfolio. Demo mode uses mock baselines; production runs the module in lib/risk/cvar.ts against live positions.",
  },
  {
    icon: GitBranch,
    title: "Scenario engine",
    body: "Shocks propagate across supplier tiers with severity and duration parameters. Monte Carlo bins use graph BFS contagion; async jobs drain via the scenario worker cron.",
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
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.title} className="workbench-card methodology-card">
                <div className="methodology-card-header">
                  <span className="methodology-card-icon" aria-hidden>
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h2 className="methodology-card-title">{section.title}</h2>
                </div>
                <p className="methodology-card-body">{section.body}</p>
              </article>
            );
          })}
        </div>
        <p className="methodology-footnote">
          Demo data only. See <code>lib/risk/</code> and <code>lib/ingest/</code> for implementation
          stubs.
        </p>
      </main>
    </>
  );
}

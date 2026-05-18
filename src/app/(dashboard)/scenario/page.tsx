import { Suspense } from "react";
import { getScenarios } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { CompactMetricsStrip } from "@/components/shell/CompactMetricsStrip";
import { ScenarioPageClient } from "@/components/scenario/ScenarioPageClient";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";

export const metadata = {
  title: "Scenario Workbench — Ripple",
};

export default async function ScenarioPage() {
  const scenarios = await getScenarios();

  return (
    <>
      <PageHeader
        title="Scenario Workbench"
        subtitle="What-if loss distribution · contagion preview"
      />
      <CompactMetricsStrip />
      <main className="content-container">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Scenario" },
          ]}
        />
        <span className="section-label">Select a scenario to simulate</span>
        <Suspense fallback={<p className="empty-state">Loading workbench…</p>}>
          <ScenarioPageClient scenarios={scenarios} />
        </Suspense>
      </main>
    </>
  );
}

import { Suspense } from "react";
import { getScenarios } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { ScenarioPageClient } from "@/components/scenario/ScenarioPageClient";
import { ScenarioAlertsStrip } from "@/components/alerts/ScenarioAlertsStrip";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";

export const metadata = {
  title: "Ripple | Scenario Workbench",
};

export default async function ScenarioPage() {
  const scenarios = await getScenarios();

  return (
    <>
      <PageHeader
        title="Scenario Workbench"
        subtitle="What-if loss distribution · contagion preview"
      />
      <main className="content-container">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Scenario" },
          ]}
        />
        <span className="section-label" id="scenario-alerts">
          Active alerts
        </span>
        <ScenarioAlertsStrip />
        <span className="section-label">Select a scenario to simulate</span>
        <Suspense fallback={<p className="empty-state">Loading workbench…</p>}>
          <ScenarioPageClient scenarios={scenarios} />
        </Suspense>
      </main>
    </>
  );
}

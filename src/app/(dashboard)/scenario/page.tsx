import { getScenarios } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { ScenarioWorkbench } from "@/components/scenario/ScenarioWorkbench";

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
      <main className="content-container">
        <span className="section-label">Select a scenario to simulate</span>
        <ScenarioWorkbench scenarios={scenarios} />
      </main>
    </>
  );
}

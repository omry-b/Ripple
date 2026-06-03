"use client";

import { useLiveData } from "@/context/LiveDataContext";
import { AlertsOverviewPanel } from "./AlertsOverviewPanel";

/** Clickable open alerts on the scenario workbench (same panel as overview). */
export function ScenarioAlertsStrip() {
  const { dashboard, snapshot } = useLiveData();
  if (!dashboard) return null;

  const openCount = snapshot?.openAlertsCount ?? dashboard.snapshot.openAlertsCount;

  return (
    <div className="scenario-alerts-panel">
      <AlertsOverviewPanel
        initialAlerts={dashboard.alerts}
        totalOpenCount={openCount}
        defaultViewLimit={6}
        showViewAllLink
      />
    </div>
  );
}

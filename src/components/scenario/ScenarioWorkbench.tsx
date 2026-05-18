"use client";

import { useCallback, useState } from "react";
import type { Scenario } from "@/types/domain";
import { usePerspectiveTilt } from "@/lib/hooks";

type ScenarioWorkbenchProps = {
  scenarios: Scenario[];
};

export function ScenarioWorkbench({ scenarios }: ScenarioWorkbenchProps) {
  const [workbenchView, setWorkbenchView] = useState<"select" | "results">("select");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);

  usePerspectiveTilt(".scenario-card", 12);

  const runSimulation = useCallback((scenario: Scenario) => {
    setActiveScenario(scenario);
    setWorkbenchView("results");
    setBarHeights(scenario.profile.map(() => 0));
    scenario.profile.forEach((magnitude, i) => {
      setTimeout(() => {
        setBarHeights((prev) => {
          const next = [...prev];
          next[i] = magnitude;
          return next;
        });
      }, 50 * i);
    });
  }, []);

  const resetWorkbench = () => {
    setWorkbenchView("select");
    setActiveScenario(null);
    setBarHeights([]);
  };

  return (
    <section className="workbench-card reveal">
      <div className="workbench-tabs">
        <span className={`workbench-tab${workbenchView === "select" ? " active" : ""}`}>
          Select Scenario
        </span>
        <span className={`workbench-tab${workbenchView === "results" ? " active" : ""}`}>
          Results Simulation
        </span>
      </div>

      {workbenchView === "select" && (
        <div className="scenario-grid">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="scenario-card"
              role="button"
              tabIndex={0}
              onClick={() => runSimulation(scenario)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  runSimulation(scenario);
                }
              }}
            >
              <div>
                <div className="scenario-name">{scenario.name}</div>
                <div className="scenario-sub">{scenario.subtitle}</div>
                <p className="scenario-preview">{scenario.preview}</p>
              </div>
              <button type="button" className="scenario-btn">
                Run Simulation →
              </button>
            </div>
          ))}
        </div>
      )}

      {workbenchView === "results" && activeScenario && (
        <div className="simulation-result-view visible">
          <div className="chart-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title" style={{ marginBottom: 0 }}>
                {activeScenario.name} Loss Distribution Run
              </span>
              <button type="button" className="reset-workbench-btn" onClick={resetWorkbench}>
                ← Escape Run
              </button>
            </div>
            <div className="chart-bars-container">
              {activeScenario.profile.map((magnitude, i) => (
                <div
                  key={i}
                  className={`chart-bar${i > 7 ? " highlighted-loss" : ""}`}
                  style={{ height: `${barHeights[i] ?? 0}%` }}
                />
              ))}
            </div>
            <div className="chart-axis-labels">
              <span>Minimum Variance Bound</span>
              <span>Target Severity Threshold (Tail Loss Risk)</span>
            </div>
          </div>
          <div className="impact-list-panel">
            <div className="card-title" style={{ marginBottom: 4 }}>
              Top Contagion Entities
            </div>
            {activeScenario.impacts.map((impact) => {
              const [value, ...nameParts] = impact.split(" ");
              const name = nameParts.join(" ");
              return (
                <div key={impact} className="impact-row">
                  <span className="impact-name">{name}</span>
                  <span className="impact-val">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

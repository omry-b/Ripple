"use client";

import { useCallback, useEffect, useState } from "react";
import type { Scenario, SimulationRun } from "@/types/domain";
import { usePerspectiveTilt } from "@/lib/hooks";
import { runScenarioApi, fetchSimulationRuns } from "@/lib/client/api";
import { formatAsOf } from "@/lib/format";

type ScenarioWorkbenchProps = {
  scenarios: Scenario[];
};

export function ScenarioWorkbench({ scenarios }: ScenarioWorkbenchProps) {
  const [workbenchView, setWorkbenchView] = useState<"select" | "results">("select");
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const [history, setHistory] = useState<SimulationRun[]>([]);
  const [running, setRunning] = useState(false);

  usePerspectiveTilt(".scenario-card", 12);

  const loadHistory = useCallback(async () => {
    try {
      const { runs } = await fetchSimulationRuns();
      setHistory(runs);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const animateBars = useCallback((profile: number[]) => {
    setBarHeights(profile.map(() => 0));
    profile.forEach((magnitude, i) => {
      setTimeout(() => {
        setBarHeights((prev) => {
          const next = [...prev];
          next[i] = magnitude;
          return next;
        });
      }, 50 * i);
    });
  }, []);

  const runSimulation = useCallback(
    async (scenario: Scenario) => {
      setRunning(true);
      try {
        const { run } = await runScenarioApi(scenario.id);
        setActiveRun(run);
        setWorkbenchView("results");
        animateBars(run.profile);
        await loadHistory();
      } catch {
        setActiveRun({
          id: `local-${Date.now()}`,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          ranAt: new Date().toISOString(),
          profile: scenario.profile,
          impacts: scenario.impacts,
        });
        setWorkbenchView("results");
        animateBars(scenario.profile);
      } finally {
        setRunning(false);
      }
    },
    [animateBars, loadHistory]
  );

  const openHistoryRun = (run: SimulationRun) => {
    setActiveRun(run);
    setWorkbenchView("results");
    animateBars(run.profile);
  };

  const resetWorkbench = () => {
    setWorkbenchView("select");
    setActiveRun(null);
    setBarHeights([]);
  };

  return (
    <>
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
                aria-busy={running}
                onClick={() => !running && void runSimulation(scenario)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!running) void runSimulation(scenario);
                  }
                }}
              >
                <div>
                  <div className="scenario-name">{scenario.name}</div>
                  <div className="scenario-sub">{scenario.subtitle}</div>
                  <p className="scenario-preview">{scenario.preview}</p>
                </div>
                <button type="button" className="scenario-btn" disabled={running}>
                  {running ? "Running…" : "Run Simulation →"}
                </button>
              </div>
            ))}
          </div>
        )}

        {workbenchView === "results" && activeRun && (
          <div className="simulation-result-view visible">
            <div className="chart-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="card-title" style={{ marginBottom: 0 }}>
                  {activeRun.scenarioName} Loss Distribution Run
                </span>
                <button type="button" className="reset-workbench-btn" onClick={resetWorkbench}>
                  ← Escape Run
                </button>
              </div>
              <div className="chart-bars-container">
                {activeRun.profile.map((magnitude, i) => (
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
              {activeRun.impacts.map((impact) => {
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

      {history.length > 0 && (
        <section className="workbench-card" style={{ marginTop: 8 }}>
          <span className="section-label" style={{ marginTop: 0 }}>
            Recent simulation runs
          </span>
          <ul className="run-history-list">
            {history.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  className="run-history-item"
                  onClick={() => openHistoryRun(run)}
                >
                  <span className="run-history-name">{run.scenarioName}</span>
                  <span className="run-history-time">{formatAsOf(run.ranAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

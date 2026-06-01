"use client";

import { useCallback, useEffect, useState } from "react";
import type { Scenario, SimulationRun } from "@/types/domain";
import { usePerspectiveTilt } from "@/lib/hooks";
import {
  runScenarioApi,
  runScenarioAsyncApi,
  fetchScenarioJob,
  fetchSimulationRuns,
} from "@/lib/client/api";
import { formatAsOf } from "@/lib/format";
import { exportSimulationRunCsv } from "@/lib/export/entities";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { SimulationLossChart } from "@/components/scenario/SimulationLossChart";

type ScenarioWorkbenchProps = {
  scenarios: Scenario[];
  initialSeverity?: number;
  initialDurationDays?: number;
  initialScenarioId?: string;
};

export function ScenarioWorkbench({
  scenarios,
  initialSeverity = 100,
  initialDurationDays = 30,
  initialScenarioId,
}: ScenarioWorkbenchProps) {
  const { permissions } = useDemoAuth();
  const canRun = permissions.runScenarios;
  const [workbenchView, setWorkbenchView] = useState<"select" | "results" | "compare">("select");
  const [activeRun, setActiveRun] = useState<SimulationRun | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const [history, setHistory] = useState<SimulationRun[]>([]);
  const [running, setRunning] = useState(false);
  const [severity, setSeverity] = useState(initialSeverity);
  const [durationDays, setDurationDays] = useState(initialDurationDays);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [useAsyncJob, setUseAsyncJob] = useState(false);

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
      if (!canRun) return;
      setRunning(true);
      try {
        if (useAsyncJob) {
          const { job } = await runScenarioAsyncApi(scenario.id, { severity, durationDays });
          let polled = job;
          for (let i = 0; i < 20 && polled.status !== "completed" && polled.status !== "failed"; i += 1) {
            await new Promise((r) => setTimeout(r, 300));
            const res = await fetchScenarioJob(polled.id);
            polled = res.job;
          }
          if (polled.status === "failed" || !polled.run) {
            throw new Error(polled.error ?? "Async simulation failed");
          }
          setActiveRun(polled.run);
          setWorkbenchView("results");
          animateBars(polled.run.profile);
        } else {
          const { run } = await runScenarioApi(scenario.id, { severity, durationDays });
          setActiveRun(run);
          setWorkbenchView("results");
          animateBars(run.profile);
        }
        await loadHistory();
      } catch {
        const profile = scenario.profile.map((v) =>
          Math.min(100, Math.round(v * (severity / 100)))
        );
        setActiveRun({
          id: `local-${Date.now()}`,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          ranAt: new Date().toISOString(),
          profile,
          impacts: scenario.impacts,
        });
        setWorkbenchView("results");
        animateBars(profile);
      } finally {
        setRunning(false);
      }
    },
    [animateBars, loadHistory, severity, durationDays, canRun, useAsyncJob]
  );

  useEffect(() => {
    if (!initialScenarioId) return;
    const scenario = scenarios.find((s) => s.id === initialScenarioId);
    if (scenario) void runSimulation(scenario);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once from shared URL
  }, []);

  const openHistoryRun = (run: SimulationRun) => {
    setActiveRun(run);
    setWorkbenchView("results");
    animateBars(run.profile);
  };

  const resetWorkbench = () => {
    setWorkbenchView("select");
    setActiveRun(null);
    setBarHeights([]);
    setCompareIds([]);
  };

  const toggleCompare = (runId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(runId)) return prev.filter((id) => id !== runId);
      if (prev.length >= 2) return [prev[1], runId];
      return [...prev, runId];
    });
  };

  const compareRuns = compareIds
    .map((id) => history.find((r) => r.id === id))
    .filter((r): r is SimulationRun => Boolean(r));

  const openCompare = () => {
    if (compareRuns.length === 2) setWorkbenchView("compare");
  };

  const copyShareLink = async (scenarioId?: string) => {
    const params = new URLSearchParams({
      severity: String(severity),
      duration: String(durationDays),
    });
    if (scenarioId) params.set("scenario", scenarioId);
    const url = `${window.location.origin}/scenario?${params.toString()}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <>
      <section className="workbench-card reveal">
        <div className="scenario-params-bar">
          <button
            type="button"
            className="filter-export-btn"
            onClick={() => void copyShareLink()}
          >
            {shareCopied ? "Link copied" : "Copy share link"}
          </button>
          <label className="scenario-param">
            <span>Severity {severity}%</span>
            <input
              type="range"
              min={50}
              max={150}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              aria-label="Scenario severity"
            />
          </label>
          <label className="scenario-param scenario-param-checkbox">
            <input
              type="checkbox"
              checked={useAsyncJob}
              onChange={(e) => setUseAsyncJob(e.target.checked)}
            />
            <span>Async job (submit → poll)</span>
          </label>
          {useAsyncJob && (
            <p className="watchlist-manager-hint scenario-async-hint">
              Jobs save to Postgres; Cloudflare drains the queue every 5 minutes. Poll here
              until complete, or check back shortly.
            </p>
          )}
          <label className="scenario-param">
            <span>Duration {durationDays} days</span>
            <input
              type="range"
              min={7}
              max={90}
              step={1}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              aria-label="Scenario duration in days"
            />
          </label>
        </div>

        <div className="workbench-tabs">
          <span className={`workbench-tab${workbenchView === "select" ? " active" : ""}`}>
            Select Scenario
          </span>
          <span className={`workbench-tab${workbenchView === "results" ? " active" : ""}`}>
            Results Simulation
          </span>
          <span className={`workbench-tab${workbenchView === "compare" ? " active" : ""}`}>
            Compare Runs
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
                onClick={() => canRun && !running && void runSimulation(scenario)}
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
                <button type="button" className="scenario-btn" disabled={running || !canRun}>
                  {!canRun ? "Viewer (read only)" : running ? "Running…" : "Run Simulation →"}
                </button>
              </div>
            ))}
          </div>
        )}

        {workbenchView === "results" && activeRun && (
          <div className="simulation-result-view visible">
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span className="card-title" style={{ marginBottom: 0 }}>
                {activeRun.scenarioName} Loss Distribution Run
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="filter-export-btn"
                  onClick={() => activeRun && exportSimulationRunCsv(activeRun)}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="filter-export-btn"
                  onClick={() => void copyShareLink(activeRun.scenarioId)}
                >
                  Share run
                </button>
                <button type="button" className="reset-workbench-btn" onClick={resetWorkbench}>
                  ← Escape Run
                </button>
              </div>
            </div>
            <div className="chart-panel">
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
            {activeRun.lossDistribution && (
              <SimulationLossChart bins={activeRun.lossDistribution} />
            )}
            <div className="impact-list-panel">
              <div className="card-title" style={{ marginBottom: 4 }}>
                Top Contagion Entities
              </div>
              {activeRun.contagionEntities?.map((name) => (
                <div key={name} className="impact-row">
                  <span className="impact-name">{name}</span>
                </div>
              ))}
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

        {workbenchView === "compare" && compareRuns.length === 2 && (
          <div className="scenario-compare-grid">
            {compareRuns.map((run) => (
              <div key={run.id} className="scenario-compare-panel">
                <h3 className="scenario-compare-title">{run.scenarioName}</h3>
                <p className="scenario-compare-meta">{formatAsOf(run.ranAt)}</p>
                <div className="chart-bars-container chart-bars-compact">
                  {run.profile.map((magnitude, i) => (
                    <div
                      key={i}
                      className={`chart-bar${i > 7 ? " highlighted-loss" : ""}`}
                      style={{ height: `${magnitude}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <button type="button" className="reset-workbench-btn" onClick={resetWorkbench}>
              ← Back to scenarios
            </button>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="workbench-card" style={{ marginTop: 8 }}>
          <div className="run-history-header">
            <span className="section-label" style={{ marginTop: 0 }}>
              Recent simulation runs
            </span>
            {compareIds.length === 2 && (
              <button type="button" className="filter-export-btn" onClick={openCompare}>
                Compare selected →
              </button>
            )}
          </div>
          <ul className="run-history-list">
            {history.map((run) => {
              const selected = compareIds.includes(run.id);
              return (
                <li key={run.id} className="run-history-row">
                  <label className="run-compare-check">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCompare(run.id)}
                      aria-label={`Select ${run.scenarioName} for compare`}
                    />
                  </label>
                  <button
                    type="button"
                    className="run-history-item"
                    onClick={() => openHistoryRun(run)}
                  >
                    <span className="run-history-name">{run.scenarioName}</span>
                    <span className="run-history-time">{formatAsOf(run.ranAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

"use client";

import { useCallback, useState } from "react";
import {
  TICKER_ITEMS,
  TOP_COMPANIES_MINI,
  COMPANY_ROWS,
  ALERTS,
  STREAMS,
  SCENARIOS,
  LEVEL_COLOR,
  type Scenario,
} from "@/lib/data";
import {
  useRevealOnScroll,
  useMetricCounters,
  useCardSpotlight,
  usePerspectiveTilt,
} from "@/lib/hooks";

const NAV_TABS = ["Overview", "Signals", "Scenario", "Companies"] as const;

const SPOTLIGHT_IDS = [
  "bento-map-card",
  "bento-cvar-card",
  "bento-signals-card",
  "bento-exposed-card",
  "bento-table-card",
  "stream-card-1",
  "stream-card-2",
  "stream-card-3",
  "stream-card-4",
];

function TickerSegment() {
  return (
    <div className="ticker-segment">
      {TICKER_ITEMS.map((item) => (
        <span key={item.label} style={{ display: "contents" }}>
          <div className="ticker-item">
            <span className="ticker-dot" style={{ color: LEVEL_COLOR[item.level] }}>
              ●
            </span>
            <span className="ticker-label">{item.label}</span>
            <span style={{ color: LEVEL_COLOR[item.level] }}>
              {item.level.toUpperCase()}
            </span>
          </div>
          <span className="ticker-divider">│</span>
        </span>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<(typeof NAV_TABS)[number]>("Overview");
  const [workbenchView, setWorkbenchView] = useState<"select" | "results">("select");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);

  useRevealOnScroll();
  useMetricCounters();
  useCardSpotlight(SPOTLIGHT_IDS);
  usePerspectiveTilt(".table-row-interactive", 6);
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
    <>
      <nav className="nav-header" role="navigation">
        <span className="nav-brand">Ripple</span>
        <div className="nav-tabs" role="tablist">
          {NAV_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`nav-tab-item${activeTab === tab ? " active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="nav-status">
          <span className="pulse-dot live" role="status" />
          <span className="status-text">Live</span>
        </div>
      </nav>

      <div className="ticker-viewport" aria-live="polite">
        <div className="ticker-fade-left" />
        <div className="ticker-fade-right" />
        <div className="ticker-track">
          <TickerSegment />
          <TickerSegment />
        </div>
      </div>

      <header className="hero-container">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="hero-inner">
          <span className="hero-eyebrow">GLOBAL SUPPLY CHAIN INTELLIGENCE</span>
          <h1 className="gradient-wordmark">Ripple</h1>
          <div className="hero-stats-row">
            <div className="hero-stat-box">
              <span className="hero-metric critical-accent" id="counter-index">
                0.0
              </span>
              <span className="hero-stat-label">Risk Index</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-box">
              <span className="hero-metric" id="counter-exposed">
                0
              </span>
              <span className="hero-stat-label">Exposed Cos</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-box">
              <span className="hero-metric critical-accent">
                $<span id="counter-cvar-hero">0.0</span>B
              </span>
              <span className="hero-stat-label">CVaR₉₅ Baseline</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-box">
              <span className="hero-metric" id="counter-signals">
                0
              </span>
              <span className="hero-stat-label">Live Signals</span>
            </div>
          </div>
        </div>
      </header>

      <main className="content-container">
        <span className="section-label">Live Risk Overview</span>
        <section className="bento-grid">
          <div className="bento-card bento-large" id="bento-map-card">
            <div>
              <div className="card-title">Global Risk Map</div>
              <svg
                className="map-container"
                viewBox="0 0 300 150"
                aria-label="Global risk map tracking supply chain disruptions"
              >
                <rect width="300" height="150" fill="#0D0D0D" />
                <line x1="0" y1="75" x2="300" y2="75" className="map-grid-line" />
                <line x1="150" y1="0" x2="150" y2="150" className="map-grid-line" />
                <g className="map-continent">
                  <ellipse cx="60" cy="55" rx="35" ry="22" />
                  <ellipse cx="85" cy="95" rx="20" ry="18" />
                  <ellipse cx="165" cy="45" rx="30" ry="24" />
                  <ellipse cx="235" cy="50" rx="28" ry="18" />
                  <ellipse cx="180" cy="95" rx="16" ry="20" />
                  <ellipse cx="255" cy="105" rx="14" ry="10" />
                </g>
                <circle cx="220" cy="55" r="14" fill="#EF4444" opacity="0.06" className="pulse-ring" />
                <circle cx="220" cy="55" r="6" fill="#EF4444" opacity="0.18" />
                <circle cx="220" cy="55" r="2.5" fill="#EF4444" opacity="0.95" />
                <circle cx="205" cy="80" r="11" fill="#F59E0B" opacity="0.06" className="pulse-ring" />
                <circle cx="205" cy="80" r="5" fill="#F59E0B" opacity="0.18" />
                <circle cx="205" cy="80" r="2" fill="#F59E0B" opacity="0.85" />
                <circle cx="145" cy="40" r="11" fill="#F59E0B" opacity="0.06" className="pulse-ring" />
                <circle cx="145" cy="40" r="5" fill="#F59E0B" opacity="0.18" />
                <circle cx="145" cy="40" r="2" fill="#F59E0B" opacity="0.85" />
              </svg>
            </div>
            <div className="map-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "#EF4444" }} />
                Critical ×1
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "#F59E0B" }} />
                Elevated ×2
              </span>
            </div>
          </div>

          <div className="bento-card bento-wide" id="bento-cvar-card">
            <div className="card-title">CVaR₉₅ · 95th Percentile</div>
            <div className="metric-display-large critical-accent">$2.1B</div>
            <div className="card-subtitle">↑ $400M above 30-day baseline</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" />
            </div>
          </div>

          <div className="bento-card bento-small" id="bento-signals-card">
            <div className="card-title">Live Signals</div>
            <div className="metric-display-medium" id="bento-val-signals">
              0
            </div>
            <div className="card-subtitle">+12 past 24h · 3 elevated</div>
          </div>

          <div className="bento-card bento-small" id="bento-exposed-card">
            <div className="card-title">Exposed</div>
            <div className="metric-display-medium elevated-accent" id="bento-val-exposed">
              0
            </div>
            <div className="card-subtitle">of 847 tracked</div>
          </div>

          <div className="bento-card bento-wide" id="bento-table-card">
            <div className="card-title">Top Risk Companies</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="num-col">Score</th>
                  <th className="num-col">CVaR</th>
                  <th className="num-col">Δ7d</th>
                </tr>
              </thead>
              <tbody>
                {TOP_COMPANIES_MINI.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td
                      className="num-col"
                      style={{
                        color: row.score >= 70 ? "#EF4444" : "#F59E0B",
                        fontWeight: 600,
                      }}
                    >
                      {row.score}
                    </td>
                    <td className="num-col">{row.cvar}</td>
                    <td className="num-col" style={{ color: "#EF4444" }}>
                      {row.delta7d}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <span className="section-label">Active Alerts · 3 Open</span>
        <section className="atmosphere-section reveal">
          <div className="atmosphere-blob-1" />
          <div className="atmosphere-blob-2" />
          <div className="glass-grid">
            {ALERTS.map((alert) =>
              alert.critical ? (
                <div key={alert.id} className="grad-border-wrapper">
                  <div className="grad-border-inner glass-card">
                    <AlertCardBody alert={alert} />
                  </div>
                </div>
              ) : (
                <div key={alert.id} className="glass-card">
                  <AlertCardBody alert={alert} />
                </div>
              )
            )}
          </div>
        </section>

        <span className="section-label">Company Exposure Ranking</span>
        <section className="table-container reveal">
          <table className="risk-table">
            <thead>
              <tr className="table-header-row">
                <th>Company</th>
                <th>Risk Score</th>
                <th>Supplier Tier</th>
                <th>CVaR₉₅</th>
                <th>Δ 7d</th>
                <th>Contagion Depth</th>
                <th className="right-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {COMPANY_ROWS.map((row) => (
                <tr key={row.name} className="table-row-interactive">
                  <td style={{ fontWeight: 600, color: "#F5F5F5" }}>{row.name}</td>
                  <td>
                    <span
                      className={`score-badge ${row.scoreLevel === "critical" ? "critical-badge" : "elevated-badge"}`}
                    >
                      {row.score}
                    </span>
                  </td>
                  <td className="mono-cell">{row.tier}</td>
                  <td className="mono-cell">{row.cvar}</td>
                  <td className={`trend-indicator ${row.deltaTrend}`}>{row.delta7d}</td>
                  <td className="mono-cell">{row.contagionHops} hops</td>
                  <td className="right-cell">
                    <button
                      type="button"
                      className="table-action-btn"
                      aria-label={`Analyze ${row.name} risk profile`}
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <span className="section-label">Live Signal Streams · 7 Active</span>
        <section className="stream-grid reveal">
          {STREAMS.map((stream, i) => (
            <div key={stream.id} className="stream-card" id={`stream-card-${i + 1}`}>
              <div className="stream-header">
                <span className="stream-name">{stream.name}</span>
                <span
                  className={`stream-score ${stream.level === "critical" ? "critical-text" : "elevated-text"}`}
                >
                  {stream.score}
                  <span style={{ fontSize: 9, color: "#404040" }}>/100</span>
                </span>
              </div>
              <svg width="100%" height="20" viewBox="0 0 100 20" style={{ display: "block", margin: "6px 0" }}>
                <polyline
                  points={stream.sparkline}
                  fill="none"
                  stroke={LEVEL_COLOR[stream.level]}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="stream-meta-row">
                <span
                  className={`stream-badge ${stream.level === "critical" ? "critical-bg" : "elevated-bg"}`}
                >
                  {stream.level.toUpperCase()}
                </span>
                <span className="stream-time">{stream.time}</span>
              </div>
            </div>
          ))}
        </section>

        <span className="section-label">Scenario Workbench</span>
        <section className="workbench-card reveal">
          <div className="workbench-tabs">
            <span
              className={`workbench-tab${workbenchView === "select" ? " active" : ""}`}
            >
              Select Scenario
            </span>
            <span
              className={`workbench-tab${workbenchView === "results" ? " active" : ""}`}
            >
              Results Simulation
            </span>
          </div>

          {workbenchView === "select" && (
            <div className="scenario-grid">
              {SCENARIOS.map((scenario) => (
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
      </main>
    </>
  );
}

function AlertCardBody({
  alert,
}: {
  alert: (typeof ALERTS)[number];
}) {
  return (
    <>
      <div>
        <span
          className={`alert-status ${alert.level === "critical" ? "critical-text" : "elevated-text"}`}
        >
          {alert.statusLabel}
        </span>
        <div className="alert-event">{alert.title}</div>
        <p className="alert-detail">{alert.detail}</p>
      </div>
      <div>
        <div className="alert-meta">{alert.meta}</div>
        <button
          type="button"
          className={`alert-action-btn${alert.level === "elevated" ? " elevated-btn" : ""}`}
          aria-label={`View asset exposure for ${alert.title}`}
        >
          View Exposure →
        </button>
      </div>
    </>
  );
}

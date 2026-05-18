import type {
  Alert,
  Company,
  DashboardPayload,
  DashboardSnapshot,
  Scenario,
  ScoreFactor,
  SignalStream,
  TickerItem,
} from "@/types/domain";
import { alertState } from "@/lib/mock/alert-state";
import { getScoreFactorsForCompany } from "@/lib/mock/score-factors";

const COMPANIES: Company[] = [
  {
    id: "apple",
    name: "Apple Inc.",
    score: 81,
    tier: "Tier 1",
    cvar: "$1.4B",
    cvarUsd: 1.4e9,
    delta7d: "↑ +9",
    deltaTrend: "bad",
    contagionHops: 3,
    scoreLevel: "critical",
  },
  {
    id: "tsmc",
    name: "TSMC",
    score: 74,
    tier: "Tier 2",
    cvar: "$0.7B",
    cvarUsd: 0.7e9,
    delta7d: "↑ +12",
    deltaTrend: "bad",
    contagionHops: 2,
    scoreLevel: "critical",
  },
  {
    id: "foxconn",
    name: "Foxconn",
    score: 68,
    tier: "Tier 1",
    cvar: "$0.5B",
    cvarUsd: 0.5e9,
    delta7d: "↑ +6",
    deltaTrend: "bad",
    contagionHops: 3,
    scoreLevel: "elevated",
  },
  {
    id: "samsung",
    name: "Samsung",
    score: 58,
    tier: "Tier 2",
    cvar: "$0.3B",
    cvarUsd: 0.3e9,
    delta7d: "↓ -2",
    deltaTrend: "good",
    contagionHops: 2,
    scoreLevel: "elevated",
  },
  {
    id: "qualcomm",
    name: "Qualcomm",
    score: 52,
    tier: "Tier 2",
    cvar: "$0.2B",
    cvarUsd: 0.2e9,
    delta7d: "↑ +4",
    deltaTrend: "bad",
    contagionHops: 3,
    scoreLevel: "elevated",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    score: 49,
    tier: "Tier 1",
    cvar: "$0.2B",
    cvarUsd: 0.2e9,
    delta7d: "↑ +3",
    deltaTrend: "bad",
    contagionHops: 2,
    scoreLevel: "elevated",
  },
  {
    id: "amd",
    name: "AMD",
    score: 44,
    tier: "Tier 2",
    cvar: "$0.1B",
    cvarUsd: 0.1e9,
    delta7d: "↓ -1",
    deltaTrend: "good",
    contagionHops: 2,
    scoreLevel: "elevated",
  },
];

const EXTENDED_COMPANIES: Company[] = Array.from({ length: 25 }, (_, i) => {
  const n = i + 1;
  const score = 28 + ((n * 7) % 45);
  const tier = n % 3 === 0 ? "Tier 1" : "Tier 2";
  const cvarUsd = Math.round((0.05 + (n % 10) * 0.03) * 1e9);
  return {
    id: `supplier-${n}`,
    name: `SupplyCo ${n}`,
    score,
    tier,
    cvar: `$${(cvarUsd / 1e9).toFixed(1)}B`,
    cvarUsd,
    delta7d: n % 2 === 0 ? `↑ +${n % 8}` : `↓ -${n % 4}`,
    deltaTrend: n % 2 === 0 ? "bad" : "good",
    contagionHops: 1 + (n % 3),
    scoreLevel: score >= 60 ? "critical" : "elevated",
  } as Company;
});

const ALL_COMPANIES: Company[] = [...COMPANIES, ...EXTENDED_COMPANIES];

const TICKER: TickerItem[] = [
  { label: "TAIWAN STRAIT", level: "critical" },
  { label: "SEA PORT CONGESTION", level: "elevated" },
  { label: "TSMC SIGNAL", level: "elevated" },
  { label: "ROTTERDAM PORT", level: "normal" },
  { label: "RED SEA ROUTING", level: "elevated" },
  { label: "SHANGHAI PORT", level: "normal" },
  { label: "BNSF FREIGHT", level: "normal" },
  { label: "TYPHOON MAWAR", level: "elevated" },
  { label: "CHIP LEAD TIMES", level: "elevated" },
  { label: "SUEZ WATCH", level: "normal" },
];

const STREAMS: SignalStream[] = [
  {
    id: "ais",
    name: "AIS / Shipping",
    category: "Logistics",
    score: 89,
    level: "critical",
    sparkline: "0,18 15,16 30,12 45,14 60,8 75,5 100,2",
    history7d: [62, 68, 74, 78, 82, 86, 89],
    time: "2m ago",
    description:
      "Vessel density anomalies and route deviations concentrated in the Taiwan Strait corridor vs 30-day baseline.",
    relatedCompanyIds: ["apple", "foxconn", "tsmc"],
    methodology: "AIS positional delta · 6h rolling window",
  },
  {
    id: "geo",
    name: "Geopolitical",
    category: "Geopolitical",
    score: 91,
    level: "critical",
    sparkline: "0,17 20,15 40,11 60,13 80,6 100,2",
    history7d: [58, 65, 72, 78, 84, 88, 91],
    time: "5m ago",
    description:
      "Escalation index from structured event feeds and maritime exclusion zone advisories in APAC.",
    relatedCompanyIds: ["tsmc", "apple", "qualcomm"],
    methodology: "GDELT-style event clustering · NLP severity",
  },
  {
    id: "financial",
    name: "Financial Health",
    category: "Financial",
    score: 55,
    level: "elevated",
    sparkline: "0,15 25,12 50,14 75,9 100,6",
    history7d: [42, 45, 48, 50, 52, 54, 55],
    time: "12m ago",
    description:
      "Composite distress score from earnings revisions, credit spreads, and hiring velocity deltas.",
    relatedCompanyIds: ["tsmc", "nvidia", "amd"],
    methodology: "Multi-factor z-score · weekly refresh",
  },
  {
    id: "commodity",
    name: "Commodity Prices",
    category: "Commodity",
    score: 48,
    level: "elevated",
    sparkline: "0,14 30,15 60,10 80,11 100,5",
    history7d: [38, 40, 42, 44, 46, 47, 48],
    time: "1h ago",
    description: "Memory and logistics fuel indices elevated vs semiconductor demand corridor.",
    relatedCompanyIds: ["samsung", "qualcomm"],
    methodology: "Futures curve stress · 24h change",
  },
  {
    id: "port",
    name: "Port Congestion",
    category: "Logistics",
    score: 62,
    level: "elevated",
    sparkline: "0,16 20,14 40,15 60,12 80,10 100,8",
    history7d: [48, 52, 55, 58, 60, 61, 62],
    time: "18m ago",
    description: "Yard occupancy and dwell time spikes at Singapore and Port Klang hubs.",
    relatedCompanyIds: ["foxconn", "samsung"],
    methodology: "Port dwell percentile · regional aggregate",
  },
  {
    id: "weather",
    name: "Severe Weather",
    category: "Weather",
    score: 41,
    level: "elevated",
    sparkline: "0,12 25,14 50,11 75,13 100,9",
    history7d: [32, 34, 36, 38, 39, 40, 41],
    time: "32m ago",
    description: "Typhoon track probability intersecting major APAC fab and port nodes.",
    relatedCompanyIds: ["tsmc", "foxconn"],
    methodology: "NOAA track cone · asset geofence",
  },
  {
    id: "freight",
    name: "Freight Rates",
    category: "Logistics",
    score: 36,
    level: "normal",
    sparkline: "0,10 30,11 60,9 80,10 100,8",
    history7d: [30, 31, 32, 33, 34, 35, 36],
    time: "2h ago",
    description: "Trans-Pacific container rates stable; Red Sea rerouting premium moderating.",
    relatedCompanyIds: ["apple", "qualcomm"],
    methodology: "FBX index · lane-weighted basket",
  },
];

const SCENARIOS: Scenario[] = [
  {
    id: "taiwan-closure",
    name: "Taiwan Strait Closure",
    subtitle: "60-day shipping route suspension",
    preview:
      "Est Impact: 147 companies · CVaR₉₅ $8.4B · 32% semiconductor structural disruption corridor.",
    profile: [24, 40, 65, 75, 82, 91, 95, 88, 72, 55, 30, 12],
    impacts: ["$5.2B (Foxconn)", "$2.1B (Apple)", "$1.1B (Pegatron)"],
  },
  {
    id: "tsmc-fire",
    name: "TSMC Fab Fire",
    subtitle: "Hsinchu Fab 12 localized infrastructure offline",
    preview:
      "Est Impact: 89 companies · CVaR₉₅ $3.2B · 18-month component lead time spikes.",
    profile: [5, 12, 28, 45, 70, 92, 84, 61, 40, 22, 10, 4],
    impacts: ["$1.8B (Apple)", "$0.9B (NVIDIA)", "$0.5B (AMD)"],
  },
  {
    id: "sea-strike",
    name: "SEA Port Strike",
    subtitle: "Singapore + Klang logistics terminal gridlock",
    preview:
      "Est Impact: 63 companies · CVaR₉₅ $1.9B · +28d structural arrival baseline changes.",
    profile: [10, 22, 35, 55, 72, 80, 68, 50, 35, 20, 11, 5],
    impacts: ["$0.8B (HP)", "$0.6B (Dell)", "$0.4B (Lenovo)"],
  },
];

function buildSnapshot(): DashboardSnapshot {
  return {
    asOf: new Date().toISOString(),
    riskIndex: 67.4,
    exposedCompanies: 47,
    trackedCompanies: 847,
    cvar95BaselineB: 2.1,
    cvar95Display: "$2.1B",
    cvarDeltaLabel: "↑ $400M above 30-day baseline",
    cvarProgressPercent: 67,
    liveSignalsCount: 214,
    signalsDeltaLabel: "+12 past 24h · 3 elevated",
    elevatedSignals24h: 3,
    openAlertsCount: alertState.list().filter((a) => a.status === "open").length,
    activeStreamsCount: 7,
    hotspots: [
      { cx: 220, cy: 55, level: "critical", alertId: "taiwan", label: "Taiwan Strait" },
      { cx: 205, cy: 80, level: "elevated", alertId: "sea-port", label: "SEA Ports" },
      { cx: 145, cy: 40, level: "elevated", alertId: "tsmc-signal", label: "TSMC Signal" },
    ],
  };
}

export const mockStore = {
  getSnapshot(): DashboardSnapshot {
    return buildSnapshot();
  },

  getDashboard(): DashboardPayload {
    const snapshot = buildSnapshot();
    return {
      snapshot,
      ticker: TICKER,
      topCompaniesMini: ALL_COMPANIES.slice(0, 3).map((c) => ({
        id: c.id,
        name: c.name,
        score: c.score,
        cvar: c.cvar,
        delta7d: c.delta7d.replace(/\s/g, ""),
      })),
      alerts: alertState.list(),
      companies: ALL_COMPANIES,
      streams: STREAMS,
      scenarios: SCENARIOS,
    };
  },

  getSignals(): SignalStream[] {
    return STREAMS;
  },

  getCompanies(): Company[] {
    return ALL_COMPANIES;
  },

  getCompany(id: string): Company | undefined {
    return ALL_COMPANIES.find((c) => c.id === id);
  },

  getAlerts(): Alert[] {
    return alertState.list();
  },

  getAlert(id: string): Alert | undefined {
    return alertState.get(id);
  },

  acknowledgeAlert(id: string): Alert | null {
    return alertState.acknowledge(id);
  },

  getScoreFactors(companyId: string): ScoreFactor[] {
    const company = ALL_COMPANIES.find((c) => c.id === companyId);
    if (!company) return [];
    return getScoreFactorsForCompany(companyId, company.score);
  },

  getScenarios(): Scenario[] {
    return SCENARIOS;
  },

  getTicker(): TickerItem[] {
    return TICKER;
  },

  getScenario(id: string): Scenario | undefined {
    return SCENARIOS.find((s) => s.id === id);
  },

  getAlertsForCompany(companyId: string): Alert[] {
    return alertState.list().filter((a) => a.affectedCompanyIds.includes(companyId));
  },

  getSignalsForCompany(companyId: string): SignalStream[] {
    return STREAMS.filter((s) => s.relatedCompanyIds.includes(companyId));
  },

  getSearchIndex() {
    return {
      companies: ALL_COMPANIES.map((c) => ({
        id: c.id,
        label: c.name,
        sublabel: `Score ${c.score} · ${c.tier}`,
        href: `/companies/${c.id}`,
        group: "Company" as const,
      })),
      alerts: alertState.list().map((a) => ({
        id: a.id,
        label: a.title,
        sublabel: a.level.toUpperCase(),
        href: `/companies?alert=${a.id}`,
        group: "Alert" as const,
      })),
      signals: STREAMS.map((s) => ({
        id: s.id,
        label: s.name,
        sublabel: `${s.score}/100 · ${s.category}`,
        href: "/signals",
        group: "Signal" as const,
      })),
    };
  },
};

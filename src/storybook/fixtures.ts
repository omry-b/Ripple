import type { Alert, Company, DashboardSnapshot, ScoreFactor, SignalStream } from "@/types/domain";
import { buildScoreHistory30d } from "@/lib/mock/score-history";

export const mockAlertCritical: Alert = {
  id: "taiwan",
  level: "critical",
  status: "open",
  statusLabel: "● CRITICAL STATE",
  title: "Taiwan Strait",
  detail:
    "Geopolitical tension + AIS vessel anomaly detected across primary maritime shipping lanes.",
  meta: "34 companies · CVaR₉₅ $2.1B · +8.1 pts today",
  critical: true,
  affectedCompanyIds: ["apple", "tsmc", "foxconn"],
  timeline: [
    { at: "2026-05-17T14:00:00Z", event: "AIS anomaly cluster detected" },
    { at: "2026-05-16T22:00:00Z", event: "Alert opened" },
  ],
};

export const mockAlertElevated: Alert = {
  id: "sea-port",
  level: "elevated",
  status: "open",
  statusLabel: "● ELEVATED EXPOSURE",
  title: "SEA Port Congestion",
  detail: "Port yard congestion multiplying across regional hubs.",
  meta: "18 companies · +11.2d avg delay",
  affectedCompanyIds: ["foxconn", "samsung"],
  timeline: [{ at: "2026-05-17T11:00:00Z", event: "Dwell times exceeded P90" }],
};

export const mockCompany: Company = {
  id: "apple",
  name: "Apple Inc.",
  region: "APAC",
  score: 81,
  tier: "Tier 1",
  cvar: "$1.4B",
  cvarUsd: 1.4e9,
  delta7d: "↑ +9",
  deltaTrend: "bad",
  contagionHops: 3,
  scoreLevel: "critical",
  history30d: buildScoreHistory30d("apple", 81),
};

export const mockStreams: SignalStream[] = [
  {
    id: "ais",
    name: "AIS / Shipping",
    category: "Logistics",
    score: 89,
    level: "critical",
    sparkline: "0,18 20,16 40,14 60,12 80,10 100,8",
    history7d: [62, 68, 74, 78, 82, 86, 89],
    time: "2m ago",
    description: "Vessel density anomalies in the Taiwan Strait corridor.",
    relatedCompanyIds: ["apple", "tsmc"],
    methodology: "AIS density z-score · lane baseline",
  },
  {
    id: "geo",
    name: "Geopolitical",
    category: "Geopolitical",
    score: 91,
    level: "critical",
    sparkline: "0,16 25,14 50,12 75,10 100,8",
    history7d: [58, 65, 72, 78, 84, 88, 91],
    time: "5m ago",
    description: "Escalation index crossed critical threshold.",
    relatedCompanyIds: ["apple", "foxconn"],
  },
  {
    id: "ports",
    name: "Port Congestion",
    category: "Logistics",
    score: 55,
    level: "elevated",
    sparkline: "0,12 30,11 60,10 80,9 100,8",
    history7d: [48, 50, 52, 53, 54, 55, 55],
    time: "18m ago",
    description: "Dwell time spikes at Singapore hub.",
    relatedCompanyIds: ["foxconn"],
  },
];

export const mockScoreFactors: ScoreFactor[] = [
  { key: "geo", label: "Geopolitical exposure", weight: 28, contribution: 23 },
  { key: "logistics", label: "Logistics & shipping", weight: 24, contribution: 19 },
  { key: "financial", label: "Financial distress", weight: 18, contribution: 15 },
  { key: "concentration", label: "Supplier concentration", weight: 20, contribution: 16 },
  { key: "weather", label: "Weather & climate", weight: 10, contribution: 8 },
];

export const mockSnapshot: DashboardSnapshot = {
  asOf: new Date().toISOString(),
  riskIndex: 67.4,
  exposedCompanies: 47,
  trackedCompanies: 847,
  cvar95BaselineB: 2.1,
  cvar95Display: "$2.1B",
  cvarDeltaLabel: "↑ $400M above 30-day baseline",
  cvarProgressPercent: 67,
  liveSignalsCount: 214,
  signalsDeltaLabel: "+12 past 24h",
  elevatedSignals24h: 3,
  openAlertsCount: 3,
  activeStreamsCount: 7,
  hotspots: [
    {
      cx: 220,
      cy: 55,
      level: "critical",
      alertId: "taiwan",
      label: "Taiwan Strait",
      region: "APAC",
    },
    {
      cx: 205,
      cy: 80,
      level: "elevated",
      alertId: "sea-port",
      label: "SEA Ports",
      region: "APAC",
    },
  ],
};

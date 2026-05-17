export type RiskLevel = "critical" | "elevated" | "normal";

export type TickerItem = {
  label: string;
  level: RiskLevel;
};

export type CompanyRow = {
  name: string;
  score: number;
  tier: string;
  cvar: string;
  delta7d: string;
  deltaTrend: "bad" | "good";
  contagionHops: number;
  scoreLevel: "critical" | "elevated";
};

export type Alert = {
  id: string;
  level: RiskLevel;
  statusLabel: string;
  title: string;
  detail: string;
  meta: string;
  critical?: boolean;
};

export type Stream = {
  id: string;
  name: string;
  score: number;
  level: RiskLevel;
  sparkline: string;
  time: string;
};

export type Scenario = {
  id: string;
  name: string;
  subtitle: string;
  preview: string;
  profile: number[];
  impacts: string[];
};

export const TICKER_ITEMS: TickerItem[] = [
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

export const TOP_COMPANIES_MINI: Pick<CompanyRow, "name" | "score" | "cvar" | "delta7d">[] = [
  { name: "Apple Inc.", score: 81, cvar: "$1.4B", delta7d: "↑+9" },
  { name: "TSMC", score: 74, cvar: "$0.7B", delta7d: "↑+12" },
  { name: "Foxconn", score: 68, cvar: "$0.5B", delta7d: "↑+6" },
];

export const COMPANY_ROWS: CompanyRow[] = [
  { name: "Apple Inc.", score: 81, tier: "Tier 1", cvar: "$1.4B", delta7d: "↑ +9", deltaTrend: "bad", contagionHops: 3, scoreLevel: "critical" },
  { name: "TSMC", score: 74, tier: "Tier 2", cvar: "$0.7B", delta7d: "↑ +12", deltaTrend: "bad", contagionHops: 2, scoreLevel: "critical" },
  { name: "Foxconn", score: 68, tier: "Tier 1", cvar: "$0.5B", delta7d: "↑ +6", deltaTrend: "bad", contagionHops: 3, scoreLevel: "elevated" },
  { name: "Samsung", score: 58, tier: "Tier 2", cvar: "$0.3B", delta7d: "↓ -2", deltaTrend: "good", contagionHops: 2, scoreLevel: "elevated" },
  { name: "Qualcomm", score: 52, tier: "Tier 2", cvar: "$0.2B", delta7d: "↑ +4", deltaTrend: "bad", contagionHops: 3, scoreLevel: "elevated" },
];

export const ALERTS: Alert[] = [
  {
    id: "taiwan",
    level: "critical",
    critical: true,
    statusLabel: "● CRITICAL STATE",
    title: "Taiwan Strait",
    detail: "Geopolitical tension + AIS vessel anomaly detected across primary maritime shipping lanes.",
    meta: "34 companies · CVaR₉₅ $2.1B · +8.1 pts today",
  },
  {
    id: "sea-port",
    level: "elevated",
    statusLabel: "● ELEVATED EXPOSURE",
    title: "SEA Port Congestion",
    detail: "Port yard congestion multiplying across regional hubs. Severe weather patterns compounding delays.",
    meta: "18 companies · +11.2d avg delay · $0.8B exposure",
  },
  {
    id: "tsmc",
    level: "elevated",
    statusLabel: "● ELEVATED EXPOSURE",
    title: "TSMC Financial Signal",
    detail: "Distress model variance discovered—underlying earnings compression signals matching recruitment drawdowns.",
    meta: "12 companies · CVaR₉₅ $0.3B · Tier 2 primarily",
  },
];

export const STREAMS: Stream[] = [
  { id: "1", name: "AIS / Shipping", score: 89, level: "critical", sparkline: "0,18 15,16 30,12 45,14 60,8 75,5 100,2", time: "2m ago" },
  { id: "2", name: "Geopolitical", score: 91, level: "critical", sparkline: "0,17 20,15 40,11 60,13 80,6 100,2", time: "5m ago" },
  { id: "3", name: "Financial Health", score: 55, level: "elevated", sparkline: "0,15 25,12 50,14 75,9 100,6", time: "12m ago" },
  { id: "4", name: "Commodity Prices", score: 48, level: "elevated", sparkline: "0,14 30,15 60,10 80,11 100,5", time: "1h ago" },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "taiwan-closure",
    name: "Taiwan Strait Closure",
    subtitle: "60-day shipping route suspension",
    preview: "Est Impact: 147 companies · CVaR₉₅ $8.4B · 32% semiconductor structural disruption corridor.",
    profile: [24, 40, 65, 75, 82, 91, 95, 88, 72, 55, 30, 12],
    impacts: ["$5.2B (Foxconn)", "$2.1B (Apple)", "$1.1B (Pegatron)"],
  },
  {
    id: "tsmc-fire",
    name: "TSMC Fab Fire",
    subtitle: "Hsinchu Fab 12 localized infrastructure offline",
    preview: "Est Impact: 89 companies · CVaR₉₅ $3.2B · 18-month component lead time spikes.",
    profile: [5, 12, 28, 45, 70, 92, 84, 61, 40, 22, 10, 4],
    impacts: ["$1.8B (Apple)", "$0.9B (NVIDIA)", "$0.5B (AMD)"],
  },
  {
    id: "sea-strike",
    name: "SEA Port Strike",
    subtitle: "Singapore + Klang logistics terminal gridlock",
    preview: "Est Impact: 63 companies · CVaR₉₅ $1.9B · +28d structural arrival baseline changes.",
    profile: [10, 22, 35, 55, 72, 80, 68, 50, 35, 20, 11, 5],
    impacts: ["$0.8B (HP)", "$0.6B (Dell)", "$0.4B (Lenovo)"],
  },
];

export const LEVEL_COLOR: Record<RiskLevel, string> = {
  critical: "#EF4444",
  elevated: "#F59E0B",
  normal: "#22C55E",
};

export type RiskLevel = "critical" | "elevated" | "normal";

export type TickerItem = {
  label: string;
  level: RiskLevel;
};

export type Company = {
  id: string;
  name: string;
  score: number;
  tier: string;
  cvar: string;
  cvarUsd: number;
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
  affectedCompanyIds: string[];
};

export type SignalStream = {
  id: string;
  name: string;
  category: string;
  score: number;
  level: RiskLevel;
  sparkline: string;
  time: string;
  description: string;
  relatedCompanyIds: string[];
  methodology?: string;
};

export type Scenario = {
  id: string;
  name: string;
  subtitle: string;
  preview: string;
  profile: number[];
  impacts: string[];
};

export type SimulationRun = {
  id: string;
  scenarioId: string;
  scenarioName: string;
  ranAt: string;
  profile: number[];
  impacts: string[];
};

export type CommandItem = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  group: "Navigate" | "Company" | "Alert" | "Signal";
};

export type Hotspot = {
  cx: number;
  cy: number;
  level: RiskLevel;
};

export type DashboardSnapshot = {
  asOf: string;
  riskIndex: number;
  exposedCompanies: number;
  trackedCompanies: number;
  cvar95BaselineB: number;
  cvar95Display: string;
  cvarDeltaLabel: string;
  cvarProgressPercent: number;
  liveSignalsCount: number;
  signalsDeltaLabel: string;
  elevatedSignals24h: number;
  openAlertsCount: number;
  activeStreamsCount: number;
  hotspots: Hotspot[];
};

export type DashboardPayload = {
  snapshot: DashboardSnapshot;
  ticker: TickerItem[];
  topCompaniesMini: Pick<Company, "id" | "name" | "score" | "cvar" | "delta7d">[];
  alerts: Alert[];
  companies: Company[];
  streams: SignalStream[];
  scenarios: Scenario[];
};

export const LEVEL_COLOR: Record<RiskLevel, string> = {
  critical: "#EF4444",
  elevated: "#F59E0B",
  normal: "#22C55E",
};

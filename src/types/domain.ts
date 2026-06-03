export type RiskLevel = "critical" | "elevated" | "normal";

export type GeoRegion = "APAC" | "EMEA" | "AMER";

export type TickerItem = {
  label: string;
  level: RiskLevel;
};

export type Company = {
  id: string;
  name: string;
  region: GeoRegion;
  score: number;
  tier: string;
  cvar: string;
  cvarUsd: number;
  delta7d: string;
  deltaTrend: "bad" | "good";
  contagionHops: number;
  scoreLevel: "critical" | "elevated";
  history30d: number[];
};

export type CompanyStorySource =
  | "news"
  | "reddit"
  | "social"
  | "gdelt"
  | "hackernews"
  | "bbc"
  | "sec"
  | "npr";

export type StorySourceStats = Record<string, number>;

export type CompanyStory = {
  id: string;
  title: string;
  url: string;
  source: CompanyStorySource;
  publishedAt: string;
  summary?: string;
};

export type IntelligenceFeedItem = {
  companyId: string;
  companyName: string;
  story: CompanyStory;
};

export type ScenarioRunOptions = {
  severity?: number;
  durationDays?: number;
  region?: GeoRegion;
  cvarLevel?: 95 | 99;
};

export type ScenarioShock = {
  region: GeoRegion;
  durationDays: number;
  severity: number;
  description?: string;
};

export type AlertStatus = "open" | "acknowledged" | "resolved";

export type AlertTimelineEvent = {
  at: string;
  event: string;
};

export type Alert = {
  id: string;
  level: RiskLevel;
  status: AlertStatus;
  statusLabel: string;
  title: string;
  detail: string;
  meta: string;
  critical?: boolean;
  affectedCompanyIds: string[];
  timeline: AlertTimelineEvent[];
};

export type ScoreFactor = {
  key: string;
  label: string;
  weight: number;
  contribution: number;
};

export type SignalStream = {
  id: string;
  name: string;
  category: string;
  score: number;
  level: RiskLevel;
  sparkline: string;
  history7d: number[];
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

/** Monte Carlo tail-risk metrics for a simulation run (USD). */
export type ScenarioRiskMetrics = {
  confidence: number;
  trials: number;
  expectedLossUsd: number;
  varUsd: number;
  cvarUsd: number;
  p99Usd: number;
  /** portfolioCVaR / Σ standaloneCVaR — lower means more diversification. */
  diversificationRatio: number;
  diversificationBenefitUsd: number;
};

export type SimulationRun = {
  id: string;
  scenarioId: string;
  scenarioName: string;
  ranAt: string;
  profile: number[];
  impacts: string[];
  lossDistribution?: number[];
  contagionEntities?: string[];
  shock?: ScenarioShock;
  riskMetrics?: ScenarioRiskMetrics;
};

export type CommandItem = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  group: "Navigate" | "Company" | "Alert" | "Signal";
};

export type Hotspot = {
  /** WGS84 longitude source of truth for map position */
  lng: number;
  /** WGS84 latitude */
  lat: number;
  /** Projected SVG x (Natural Earth), filled at render or snapshot refresh */
  cx: number;
  /** Projected SVG y */
  cy: number;
  level: RiskLevel;
  alertId: string;
  label: string;
  region: GeoRegion;
};

export type SupplierLink = {
  id: string;
  name: string;
  tier: "Tier 1" | "Tier 2";
  region: GeoRegion;
  score: number;
  relationship: string;
};

export type DashboardSnapshot = {
  asOf: string;
  riskIndex: number;
  exposedCompanies: number;
  trackedCompanies: number;
  /** Current portfolio tail risk (billions USD, live scored). */
  portfolioCvarB: number;
  /** 30-day rolling baseline tail risk (billions USD). */
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

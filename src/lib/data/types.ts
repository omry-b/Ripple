import type {
  Alert,
  Company,
  DashboardPayload,
  DashboardSnapshot,
  Scenario,
  ScenarioRunOptions,
  ScoreFactor,
  SignalStream,
  SimulationRun,
  TickerItem,
} from "@/types/domain";

export type SearchIndex = {
  companies: Array<{
    id: string;
    label: string;
    sublabel?: string;
    href: string;
    group: "Company";
  }>;
  alerts: Array<{
    id: string;
    label: string;
    sublabel?: string;
    href: string;
    group: "Alert";
  }>;
  signals: Array<{
    id: string;
    label: string;
    sublabel?: string;
    href: string;
    group: "Signal";
  }>;
};

export type WatchlistRecord = {
  id: string;
  name: string;
  companyIds: string[];
};

export type IngestRunRecord = {
  id: string;
  adapter: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  eventsIngested: number;
  message?: string;
};

export type WebhookSubscription = {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  createdAt: string;
};

export interface RippleDataSource {
  readonly mode: "mock" | "postgres";

  getDashboard(): Promise<DashboardPayload>;
  getSnapshot(): Promise<DashboardSnapshot>;
  getTicker(): Promise<TickerItem[]>;
  getSignals(): Promise<SignalStream[]>;
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | null>;
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | null>;
  acknowledgeAlert(id: string): Promise<Alert | null>;
  getScenarios(): Promise<Scenario[]>;
  getScenario(id: string): Promise<Scenario | null>;
  runScenario(id: string, options?: ScenarioRunOptions): Promise<SimulationRun | null>;
  getSimulationRuns(): Promise<SimulationRun[]>;
  getAlertsForCompany(companyId: string): Promise<Alert[]>;
  getSignalsForCompany(companyId: string): Promise<SignalStream[]>;
  getSearchIndex(): Promise<SearchIndex>;
  getScoreFactors(companyId: string): Promise<ScoreFactor[]>;
  refreshSnapshot(): Promise<DashboardSnapshot>;

  getWatchlists(userId: string): Promise<WatchlistRecord[]>;
  createWatchlist(userId: string, name: string): Promise<WatchlistRecord>;
  setWatchlistCompanies(watchlistId: string, companyIds: string[]): Promise<WatchlistRecord | null>;

  getIngestRuns(limit?: number): Promise<IngestRunRecord[]>;
  recordIngestRun(run: IngestRunRecord): Promise<void>;

  getWebhookSubscriptions(orgId: string): Promise<WebhookSubscription[]>;
  createWebhookSubscription(
    orgId: string,
    url: string,
    events: string[]
  ): Promise<WebhookSubscription>;

  getCompanyNote(companyId: string, userId: string): Promise<string | null>;
  setCompanyNote(companyId: string, userId: string, body: string): Promise<void>;
}

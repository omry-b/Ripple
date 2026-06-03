import { mockStore } from "@/lib/mock/store";
import { aggregateSnapshot } from "@/lib/risk/snapshot-aggregator";
import { loadRecentIngestEvents } from "@/lib/ingest/sync-risk";
import { simulationRunStore } from "@/lib/mock/simulation-runs";
import { getScoreFactorsForCompany } from "@/lib/mock/score-factors";
import type {
  RippleDataSource,
  IngestRunRecord,
  WatchlistRecord,
  WebhookSubscription,
} from "./types";

const ingestRuns: IngestRunRecord[] = [];
const watchlists = new Map<string, WatchlistRecord[]>();
const webhooks = new Map<string, WebhookSubscription[]>();
const notes = new Map<string, string>();

export const mockDataSource: RippleDataSource = {
  mode: "mock",

  getDashboard: () => mockStore.getDashboard(),
  getSnapshot: () => mockStore.getSnapshot(),
  getTicker: () => mockStore.getTicker(),
  getSignals: () => Promise.resolve(mockStore.getSignals()),
  getCompanies: () => Promise.resolve(mockStore.getCompanies()),
  getCompany: async (id) => mockStore.getCompany(id) ?? null,
  getAlerts: () => Promise.resolve(mockStore.getAlerts()),
  getAlert: async (id) => mockStore.getAlert(id) ?? null,
  acknowledgeAlert: (id) => Promise.resolve(mockStore.acknowledgeAlert(id)),
  resolveAlert: (id) => Promise.resolve(mockStore.resolveAlert(id)),
  getScenarios: () => Promise.resolve(mockStore.getScenarios()),
  getScenario: async (id) => mockStore.getScenario(id) ?? null,
  runScenario: async (id, options) => {
    const scenario = mockStore.getScenario(id);
    if (!scenario) return null;
    return simulationRunStore.run(scenario, options, mockStore.getCompanies());
  },
  getSimulationRuns: () => Promise.resolve(simulationRunStore.list()),
  getAlertsForCompany: (companyId) => Promise.resolve(mockStore.getAlertsForCompany(companyId)),
  getSignalsForCompany: (companyId) => Promise.resolve(mockStore.getSignalsForCompany(companyId)),
  getSearchIndex: () => Promise.resolve(mockStore.getSearchIndex()),
  getScoreFactors: async (companyId) => {
    const company = mockStore.getCompany(companyId);
    if (!company) return [];
    return getScoreFactorsForCompany(companyId, company.score);
  },
  refreshSnapshot: async () => {
    const ingestEvents = await loadRecentIngestEvents(200);
    return aggregateSnapshot({
      companies: await mockStore.getCompanies(),
      alerts: await mockStore.getAlerts(),
      streams: await mockStore.getSignals(),
      ingestEvents,
    });
  },

  getWatchlists: async (userId) => watchlists.get(userId) ?? [],
  createWatchlist: async (userId, name, id) => {
    const list: WatchlistRecord = {
      id: id ?? `wl_${Date.now()}`,
      name,
      companyIds: [],
    };
    const existing = watchlists.get(userId) ?? [];
    watchlists.set(userId, [...existing, list]);
    return list;
  },
  setWatchlistCompanies: async (watchlistId, companyIds) => {
    for (const [, lists] of watchlists) {
      const wl = lists.find((w) => w.id === watchlistId);
      if (wl) {
        wl.companyIds = companyIds;
        return wl;
      }
    }
    return null;
  },

  getIngestRuns: async (limit = 20) => ingestRuns.slice(0, limit),
  recordIngestRun: async (run) => {
    ingestRuns.unshift(run);
    if (ingestRuns.length > 50) ingestRuns.pop();
  },

  getWebhookSubscriptions: async (orgId) => webhooks.get(orgId) ?? [],
  createWebhookSubscription: async (orgId, url, events) => {
    const sub: WebhookSubscription = {
      id: `wh_${Date.now()}`,
      url,
      events,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    const existing = webhooks.get(orgId) ?? [];
    webhooks.set(orgId, [...existing, sub]);
    return sub;
  },

  getCompanyNote: async (companyId, userId) => notes.get(`${userId}:${companyId}`) ?? null,
  setCompanyNote: async (companyId, userId, body) => {
    notes.set(`${userId}:${companyId}`, body);
  },
};

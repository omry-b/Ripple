import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSeeded, DEMO_ORG_ID, DEMO_USER_ID } from "@/lib/db/seed";
import * as schema from "@/lib/db/schema";
import { getScoreFactorsForCompany } from "@/lib/mock/score-factors";
import { runScenarioEngine } from "@/lib/scenario/engine";
import { resolveContagionEntityNames } from "@/lib/scenario/graph-propagation";
import {
  aggregateSnapshot,
  scoreCompaniesForPayload,
} from "@/lib/risk/snapshot-aggregator";
import { normalizeHotspotGeo } from "@/lib/geo/hotspots";
import {
  buildTickerFromAllSources,
  loadRecentIngestEvents,
} from "@/lib/ingest/sync-risk";
import type {
  Alert,
  Company,
  DashboardSnapshot,
  Scenario,
  SignalStream,
  SimulationRun,
} from "@/types/domain";
import type { RippleDataSource, IngestRunRecord, WatchlistRecord, WebhookSubscription } from "./types";
import { regionForCompanyId } from "@/lib/mock/regions";
import { generateWebhookSecret } from "@/lib/webhooks/sign";
import { rememberSubscriptionSecret } from "@/lib/webhooks/delivery";

function rowToCompany(row: typeof schema.companies.$inferSelect): Company {
  return {
    id: row.id,
    name: row.name,
    region: regionForCompanyId(row.id),
    score: row.score,
    tier: row.tier,
    cvar: row.cvar,
    cvarUsd: row.cvarUsd,
    delta7d: row.delta7d,
    deltaTrend: row.deltaTrend as Company["deltaTrend"],
    contagionHops: row.contagionHops,
    scoreLevel: row.scoreLevel as Company["scoreLevel"],
    history30d: row.history30d,
  };
}

function rowToSignal(row: typeof schema.signalStreams.$inferSelect): SignalStream {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    score: row.score,
    level: row.level as SignalStream["level"],
    sparkline: row.sparkline,
    history7d: row.history7d,
    time: row.timeLabel,
    description: row.description,
    methodology: row.methodology ?? undefined,
    relatedCompanyIds: row.relatedCompanyIds,
  };
}

function rowToAlert(row: typeof schema.alerts.$inferSelect): Alert {
  return {
    id: row.id,
    level: row.level as Alert["level"],
    status: row.status as Alert["status"],
    statusLabel: row.statusLabel,
    title: row.title,
    detail: row.detail,
    meta: row.meta,
    critical: row.critical ?? undefined,
    timeline: row.timeline,
    affectedCompanyIds: row.affectedCompanyIds,
  };
}

function rowToScenario(row: typeof schema.scenarios.$inferSelect): Scenario {
  const profile = Array.isArray(row.profile) ? row.profile : [];
  const impacts = Array.isArray(row.impacts) ? row.impacts : [];
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    preview: row.preview ?? "",
    profile,
    impacts,
  };
}

async function loadSnapshotPayload(): Promise<DashboardSnapshot> {
  const db = getDb();
  const [companyRows, alertRows, streamRows] = await Promise.all([
    db.select().from(schema.companies),
    db.select().from(schema.alerts),
    db.select().from(schema.signalStreams),
  ]);

  const ingestEvents = await loadRecentIngestEvents(200);
  const snapshot = aggregateSnapshot({
    companies: companyRows.map(rowToCompany),
    alerts: alertRows.map(rowToAlert),
    streams: streamRows.map(rowToSignal),
    ingestEvents,
  });
  return {
    ...snapshot,
    hotspots: snapshot.hotspots.map(normalizeHotspotGeo),
  };
}

export const postgresDataSource: RippleDataSource = {
  mode: "postgres",

  async getDashboard() {
    await ensureSeeded();
    const db = getDb();

    const [snapshot, companyRows, alertRows, streamRows, scenarioRows, ingestEvents] =
      await Promise.all([
        loadSnapshotPayload(),
        db.select().from(schema.companies).orderBy(desc(schema.companies.score)),
        db.select().from(schema.alerts),
        db.select().from(schema.signalStreams),
        db.select().from(schema.scenarios),
        loadRecentIngestEvents(120),
      ]);

    const alerts = alertRows.map(rowToAlert);
    const streams = streamRows.map(rowToSignal);
    const companies = scoreCompaniesForPayload(
      companyRows.map(rowToCompany),
      streams
    );
    const scenarios = scenarioRows.map(rowToScenario);
    const ticker = buildTickerFromAllSources(alerts, streams, ingestEvents);

    return {
      snapshot,
      ticker,
      topCompaniesMini: companies.slice(0, 3).map((c) => ({
        id: c.id,
        name: c.name,
        score: c.score,
        cvar: c.cvar,
        delta7d: String(c.delta7d ?? "").replace(/\s/g, ""),
      })),
      alerts,
      companies,
      streams,
      scenarios,
    };
  },

  async getSnapshot() {
    await ensureSeeded();
    return loadSnapshotPayload();
  },

  async getTicker() {
    await ensureSeeded();
    const [alerts, streams, ingestEvents] = await Promise.all([
      this.getAlerts(),
      this.getSignals(),
      loadRecentIngestEvents(80),
    ]);
    return buildTickerFromAllSources(alerts, streams, ingestEvents);
  },

  async getSignals() {
    await ensureSeeded();
    const db = getDb();
    const rows = await db.select().from(schema.signalStreams);
    return rows.map(rowToSignal);
  },

  async getCompanies() {
    await ensureSeeded();
    const db = getDb();
    const rows = await db.select().from(schema.companies).orderBy(desc(schema.companies.score));
    return rows.map(rowToCompany);
  },

  async getCompany(id) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, id))
      .limit(1);
    return row ? rowToCompany(row) : null;
  },

  async getAlerts() {
    await ensureSeeded();
    const db = getDb();
    const rows = await db.select().from(schema.alerts);
    return rows.map(rowToAlert);
  },

  async getAlert(id) {
    const db = getDb();
    const [row] = await db.select().from(schema.alerts).where(eq(schema.alerts.id, id)).limit(1);
    return row ? rowToAlert(row) : null;
  },

  async acknowledgeAlert(id) {
    const db = getDb();
    const existing = await this.getAlert(id);
    if (!existing) return null;

    const updated: Alert = {
      ...existing,
      status: "acknowledged",
      statusLabel:
        existing.level === "critical" ? "● CRITICAL · ACK" : "● ELEVATED · ACK",
      timeline: [
        { at: new Date().toISOString(), event: "Acknowledged by analyst" },
        ...existing.timeline,
      ],
    };

    await db
      .update(schema.alerts)
      .set({
        status: updated.status,
        statusLabel: updated.statusLabel,
        timeline: updated.timeline,
      })
      .where(eq(schema.alerts.id, id));

    return updated;
  },

  async resolveAlert(id) {
    const db = getDb();
    const existing = await this.getAlert(id);
    if (!existing) return null;

    const updated: Alert = {
      ...existing,
      status: "resolved",
      statusLabel: "● RESOLVED",
      timeline: [
        { at: new Date().toISOString(), event: "Resolved by analyst" },
        ...existing.timeline,
      ],
    };

    await db
      .update(schema.alerts)
      .set({
        status: updated.status,
        statusLabel: updated.statusLabel,
        timeline: updated.timeline,
      })
      .where(eq(schema.alerts.id, id));

    return updated;
  },

  async getScenarios() {
    await ensureSeeded();
    const db = getDb();
    const rows = await db.select().from(schema.scenarios);
    return rows.map(rowToScenario);
  },

  async getScenario(id) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(schema.scenarios)
      .where(eq(schema.scenarios.id, id))
      .limit(1);
    return row ? rowToScenario(row) : null;
  },

  async runScenario(id, options) {
    const scenario = await this.getScenario(id);
    if (!scenario) return null;
    const region = options?.region ?? "APAC";
    const contagion = await resolveContagionEntityNames(region);
    // Live-scored portfolio drives the Monte Carlo tail-risk simulation.
    const companies = await this.getCompanies();
    const run = runScenarioEngine(scenario, options, contagion, companies);
    const db = getDb();
    await db.insert(schema.simulationRuns).values({
      id: run.id,
      scenarioId: run.scenarioId,
      scenarioName: run.scenarioName,
      ranAt: new Date(run.ranAt),
      profile: run.profile,
      impacts: run.impacts,
      severity: options?.severity ?? 100,
      durationDays: options?.durationDays ?? 30,
      organizationId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
    });
    const all = await db.select().from(schema.simulationRuns).orderBy(desc(schema.simulationRuns.ranAt));
    if (all.length > 10) {
      const toDelete = all.slice(10);
      for (const r of toDelete) {
        await db.delete(schema.simulationRuns).where(eq(schema.simulationRuns.id, r.id));
      }
    }
    return run;
  },

  async getSimulationRuns() {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.simulationRuns)
      .orderBy(desc(schema.simulationRuns.ranAt))
      .limit(10);
    return rows.map(
      (r): SimulationRun => ({
        id: r.id,
        scenarioId: r.scenarioId,
        scenarioName: r.scenarioName,
        ranAt: r.ranAt.toISOString(),
        profile: r.profile,
        impacts: r.impacts,
      })
    );
  },

  async getAlertsForCompany(companyId) {
    const alerts = await this.getAlerts();
    return alerts.filter((a) => a.affectedCompanyIds.includes(companyId));
  },

  async getSignalsForCompany(companyId) {
    const streams = await this.getSignals();
    return streams.filter((s) => s.relatedCompanyIds.includes(companyId));
  },

  async getSearchIndex() {
    const [companies, alerts, signals] = await Promise.all([
      this.getCompanies(),
      this.getAlerts(),
      this.getSignals(),
    ]);
    return {
      companies: companies.map((c) => ({
        id: c.id,
        label: c.name,
        sublabel: `Score ${c.score} · ${c.tier}`,
        href: `/companies/${c.id}`,
        group: "Company" as const,
        searchText: `${c.name} ${c.id} ${c.tier} ${c.region}`,
      })),
      alerts: alerts.map((a) => ({
        id: a.id,
        label: a.title,
        sublabel: a.level.toUpperCase(),
        href: `/companies?alert=${a.id}`,
        group: "Alert" as const,
      })),
      signals: signals.map((s) => ({
        id: s.id,
        label: s.name,
        sublabel: `${s.score}/100 · ${s.category}`,
        href: "/signals",
        group: "Signal" as const,
      })),
    };
  },

  async getScoreFactors(companyId) {
    const company = await this.getCompany(companyId);
    if (!company) return [];
    return getScoreFactorsForCompany(company);
  },

  async refreshSnapshot() {
    const [companies, alerts, streams, ingestEvents] = await Promise.all([
      this.getCompanies(),
      this.getAlerts(),
      this.getSignals(),
      loadRecentIngestEvents(200),
    ]);
    const snapshot = aggregateSnapshot({
      companies,
      alerts,
      streams,
      ingestEvents,
    });
    const db = getDb();
    const hotspots = snapshot.hotspots;
    await db.delete(schema.mapHotspots);
    if (hotspots.length > 0) {
      await db.insert(schema.mapHotspots).values(
        hotspots.map((h, i) => ({
          id: `hotspot-${i}`,
          cx: h.cx,
          cy: h.cy,
          level: h.level,
          alertId: h.alertId,
          label: h.label,
        }))
      );
    }
    await db.delete(schema.dashboardSnapshots).where(eq(schema.dashboardSnapshots.id, "latest"));
    await db.insert(schema.dashboardSnapshots).values({ id: "latest", payload: snapshot });
    return snapshot;
  },

  async getWatchlists(userId) {
    const db = getDb();
    const lists = await db
      .select()
      .from(schema.watchlists)
      .where(eq(schema.watchlists.userId, userId));
    const result: WatchlistRecord[] = [];
    for (const wl of lists) {
      const companies = await db
        .select()
        .from(schema.watchlistCompanies)
        .where(eq(schema.watchlistCompanies.watchlistId, wl.id));
      result.push({
        id: wl.id,
        name: wl.name,
        companyIds: companies.map((c) => c.companyId),
      });
    }
    return result;
  },

  async createWatchlist(userId, name, id) {
    const db = getDb();
    const watchlistId = id ?? `wl_${Date.now()}`;
    await db
      .insert(schema.watchlists)
      .values({ id: watchlistId, userId, name })
      .onConflictDoNothing();
    return { id: watchlistId, name, companyIds: [] };
  },

  async setWatchlistCompanies(watchlistId, companyIds) {
    const db = getDb();
    const [wl] = await db
      .select()
      .from(schema.watchlists)
      .where(eq(schema.watchlists.id, watchlistId))
      .limit(1);
    if (!wl) return null;
    await db
      .delete(schema.watchlistCompanies)
      .where(eq(schema.watchlistCompanies.watchlistId, watchlistId));
    if (companyIds.length > 0) {
      await db.insert(schema.watchlistCompanies).values(
        companyIds.map((companyId) => ({ watchlistId, companyId }))
      );
    }
    return { id: wl.id, name: wl.name, companyIds };
  },

  async getIngestRuns(limit = 20) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.ingestRuns)
      .orderBy(desc(schema.ingestRuns.startedAt))
      .limit(limit);
    return rows.map(
      (r): IngestRunRecord => ({
        id: r.id,
        adapter: r.adapter,
        status: r.status as IngestRunRecord["status"],
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString(),
        eventsIngested: r.eventsIngested ?? 0,
        message: r.message ?? undefined,
      })
    );
  },

  async recordIngestRun(run) {
    const db = getDb();
    await db
      .insert(schema.ingestRuns)
      .values({
        id: run.id,
        adapter: run.adapter,
        status: run.status,
        startedAt: new Date(run.startedAt),
        finishedAt: run.finishedAt ? new Date(run.finishedAt) : null,
        eventsIngested: run.eventsIngested,
        message: run.message ?? null,
      })
      .onConflictDoUpdate({
        target: schema.ingestRuns.id,
        set: {
          status: run.status,
          finishedAt: run.finishedAt ? new Date(run.finishedAt) : null,
          eventsIngested: run.eventsIngested,
          message: run.message ?? null,
        },
      });
  },

  async getWebhookSubscriptions(orgId) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.webhookSubscriptions)
      .where(eq(schema.webhookSubscriptions.organizationId, orgId));
    return rows.map(
      (r): WebhookSubscription => ({
        id: r.id,
        url: r.url,
        events: r.events,
        enabled: r.enabled,
        createdAt: r.createdAt.toISOString(),
      })
    );
  },

  async createWebhookSubscription(orgId, url, events) {
    const db = getDb();
    const id = `wh_${Date.now()}`;
    const secret = generateWebhookSecret();
    await db.insert(schema.webhookSubscriptions).values({
      id,
      organizationId: orgId,
      url,
      events,
      secret,
      enabled: true,
    });
    rememberSubscriptionSecret(id, secret);
    return {
      id,
      url,
      events,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
  },

  async getCompanyNote(companyId, _userId) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(schema.companyNotes)
      .where(eq(schema.companyNotes.companyId, companyId))
      .limit(1);
    return row?.body ?? null;
  },

  async setCompanyNote(companyId, userId, body) {
    const db = getDb();
    await db
      .delete(schema.companyNotes)
      .where(
        and(
          eq(schema.companyNotes.companyId, companyId),
          eq(schema.companyNotes.userId, userId)
        )
      );
    if (body.trim()) {
      await db.insert(schema.companyNotes).values({
        companyId,
        userId,
        body,
        updatedAt: new Date(),
      });
    }
  },
};

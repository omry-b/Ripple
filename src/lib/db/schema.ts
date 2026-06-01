import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  AlertTimelineEvent,
  DashboardSnapshot,
  Hotspot,
  RiskLevel,
  ScenarioRunOptions,
  SimulationRun,
} from "@/types/domain";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  role: text("role").notNull().default("analyst"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  tier: text("tier").notNull(),
  cvar: text("cvar").notNull(),
  cvarUsd: real("cvar_usd").notNull(),
  delta7d: text("delta_7d").notNull(),
  deltaTrend: text("delta_trend").notNull(),
  contagionHops: integer("contagion_hops").notNull(),
  scoreLevel: text("score_level").notNull(),
  history30d: jsonb("history_30d").$type<number[]>().notNull(),
  organizationId: text("organization_id").references(() => organizations.id),
});

export const signalStreams = pgTable("signal_streams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  level: text("level").notNull(),
  sparkline: text("sparkline").notNull(),
  history7d: jsonb("history_7d").$type<number[]>().notNull(),
  timeLabel: text("time_label").notNull(),
  description: text("description").notNull(),
  methodology: text("methodology"),
  relatedCompanyIds: jsonb("related_company_ids").$type<string[]>().notNull(),
  organizationId: text("organization_id").references(() => organizations.id),
});

export const signalReadings = pgTable("signal_readings", {
  id: text("id").primaryKey(),
  signalId: text("signal_id")
    .notNull()
    .references(() => signalStreams.id),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  value: real("value").notNull(),
  source: text("source").notNull(),
});

/** Live feed from worker ingest (map, ticker, dynamic alerts). */
export const ingestEvents = pgTable("ingest_events", {
  id: text("id").primaryKey(),
  adapter: text("adapter").notNull(),
  signalId: text("signal_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  severity: integer("severity").notNull(),
  lng: real("lng").notNull(),
  lat: real("lat").notNull(),
  region: text("region").notNull(),
  level: text("level").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
});

export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  level: text("level").notNull(),
  status: text("status").notNull(),
  statusLabel: text("status_label").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  meta: text("meta").notNull(),
  critical: boolean("critical").default(false),
  timeline: jsonb("timeline").$type<AlertTimelineEvent[]>().notNull(),
  affectedCompanyIds: jsonb("affected_company_ids").$type<string[]>().notNull(),
  organizationId: text("organization_id").references(() => organizations.id),
});

export const scenarios = pgTable("scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull(),
  preview: text("preview").notNull(),
  profile: jsonb("profile").$type<number[]>().notNull(),
  impacts: jsonb("impacts").$type<string[]>().notNull(),
  organizationId: text("organization_id").references(() => organizations.id),
});

export const scenarioJobs = pgTable("scenario_jobs", {
  id: text("id").primaryKey(),
  scenarioId: text("scenario_id")
    .notNull()
    .references(() => scenarios.id),
  status: text("status").notNull(),
  options: jsonb("options").$type<ScenarioRunOptions>(),
  result: jsonb("result").$type<SimulationRun>(),
  error: text("error"),
  organizationId: text("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const simulationRuns = pgTable("simulation_runs", {
  id: text("id").primaryKey(),
  scenarioId: text("scenario_id")
    .notNull()
    .references(() => scenarios.id),
  scenarioName: text("scenario_name").notNull(),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull(),
  profile: jsonb("profile").$type<number[]>().notNull(),
  impacts: jsonb("impacts").$type<string[]>().notNull(),
  severity: integer("severity"),
  durationDays: integer("duration_days"),
  organizationId: text("organization_id").references(() => organizations.id),
  userId: text("user_id").references(() => users.id),
});

export const dashboardSnapshots = pgTable("dashboard_snapshots", {
  id: text("id").primaryKey().default("latest"),
  payload: jsonb("payload").$type<DashboardSnapshot>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tickerItems = pgTable("ticker_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  label: text("label").notNull(),
  level: text("level").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const mapHotspots = pgTable("map_hotspots", {
  id: text("id").primaryKey(),
  cx: real("cx").notNull(),
  cy: real("cy").notNull(),
  level: text("level").notNull(),
  alertId: text("alert_id").notNull(),
  label: text("label").notNull(),
});

export const watchlists = pgTable("watchlists", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull().default("Default"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const watchlistCompanies = pgTable("watchlist_companies", {
  watchlistId: text("watchlist_id")
    .notNull()
    .references(() => watchlists.id),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
});

export const ingestRuns = pgTable("ingest_runs", {
  id: text("id").primaryKey(),
  adapter: text("adapter").notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  eventsIngested: integer("events_ingested").default(0),
  message: text("message"),
});

export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  url: text("url").notNull(),
  events: jsonb("events").$type<string[]>().notNull(),
  secret: text("secret"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companyNotes = pgTable(
  "company_notes",
  {
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.companyId, t.userId] })]
);

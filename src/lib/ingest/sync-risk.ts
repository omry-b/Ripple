import { desc } from "drizzle-orm";
import type { Alert, GeoRegion, SignalStream, TickerItem } from "@/types/domain";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { DEMO_ORG_ID } from "@/lib/db/seed";
import * as schema from "@/lib/db/schema";
import { pushIngestEvents, getRecentIngestEvents } from "./event-store";
import { enrichEventGeo, eventTitle, regionFromLngLat, severityToLevel } from "./geo-utils";
import type { NormalizedIngestEvent } from "./types";
import { alertState } from "@/lib/mock/alert-state";

export type PersistedIngestEvent = NormalizedIngestEvent & {
  region: GeoRegion;
  level: "critical" | "elevated" | "normal";
};

export async function persistAndSyncIngestEvents(
  rawEvents: NormalizedIngestEvent[],
  streams: SignalStream[]
): Promise<PersistedIngestEvent[]> {
  const events = rawEvents.map(enrichEventGeo).map((e) => ({
    ...e,
    region: regionFromLngLat(e.lng!, e.lat!),
    level: severityToLevel(e.severity),
  }));

  pushIngestEvents(events);

  if (isDatabaseConfigured()) {
    const db = getDb();
    for (const e of events) {
      await db
        .insert(schema.ingestEvents)
        .values({
          id: e.id,
          adapter: e.adapter,
          signalId: e.signalId ?? e.adapter,
          title: eventTitle(e.summary, e.adapter),
          summary: e.summary,
          severity: e.severity,
          lng: e.lng!,
          lat: e.lat!,
          region: e.region,
          level: e.level,
          occurredAt: new Date(e.occurredAt),
        })
        .onConflictDoUpdate({
          target: schema.ingestEvents.id,
          set: {
            severity: e.severity,
            summary: e.summary,
            title: eventTitle(e.summary, e.adapter),
            lng: e.lng!,
            lat: e.lat!,
            region: e.region,
            level: e.level,
            occurredAt: new Date(e.occurredAt),
          },
        });

      const affected = inferAffectedCompanies(e, streams);
      const level = e.level;
      const alertRow: Alert = {
        id: e.id,
        level,
        status: "open",
        statusLabel:
          level === "critical" ? "● CRITICAL STATE" : "● ELEVATED EXPOSURE",
        title: eventTitle(e.summary, e.adapter),
        detail: e.summary,
        meta: `${e.adapter.toUpperCase()} · severity ${e.severity} · ${affected.length} cos.`,
        critical: level === "critical",
        affectedCompanyIds: affected,
        timeline: [{ at: e.occurredAt, event: `Ingest: ${e.adapter}` }],
      };

      await db
        .insert(schema.alerts)
        .values({
          id: alertRow.id,
          level: alertRow.level,
          status: alertRow.status,
          statusLabel: alertRow.statusLabel,
          title: alertRow.title,
          detail: alertRow.detail,
          meta: alertRow.meta,
          critical: alertRow.critical ?? false,
          timeline: alertRow.timeline,
          affectedCompanyIds: alertRow.affectedCompanyIds,
          organizationId: DEMO_ORG_ID,
        })
        .onConflictDoUpdate({
          target: schema.alerts.id,
          set: {
            level: alertRow.level,
            status: alertRow.status,
            statusLabel: alertRow.statusLabel,
            title: alertRow.title,
            detail: alertRow.detail,
            meta: alertRow.meta,
            critical: alertRow.critical ?? false,
            timeline: alertRow.timeline,
            affectedCompanyIds: alertRow.affectedCompanyIds,
          },
        });
    }
  } else {
    alertState.mergeFromIngest(events, streams);
  }

  return events;
}

export async function loadRecentIngestEvents(limit = 200): Promise<PersistedIngestEvent[]> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.ingestEvents)
      .orderBy(desc(schema.ingestEvents.occurredAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      adapter: r.adapter,
      signalId: r.signalId,
      occurredAt: r.occurredAt.toISOString(),
      severity: r.severity,
      summary: r.summary,
      lng: r.lng,
      lat: r.lat,
      region: r.region as GeoRegion,
      level: r.level as PersistedIngestEvent["level"],
    }));
  }
  return getRecentIngestEvents(limit).map((e) => ({
    ...enrichEventGeo(e),
    region: regionFromLngLat(e.lng!, e.lat!),
    level: severityToLevel(e.severity),
  }));
}

function inferAffectedCompanies(
  event: NormalizedIngestEvent,
  streams: SignalStream[]
): string[] {
  const signalId = event.signalId ?? event.adapter;
  const stream = streams.find((s) => s.id === signalId);
  if (stream?.relatedCompanyIds.length) return stream.relatedCompanyIds;
  return [];
}

const TICKER_MAX_ITEMS = 28;
const TICKER_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type TickerCandidate = {
  label: string;
  level: TickerItem["level"];
  at: number;
  priority: number;
};

function parseOccurredAt(iso?: string): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function buildTickerFromAllSources(
  alerts: Alert[],
  streams: SignalStream[],
  ingestEvents: PersistedIngestEvent[],
  nowMs: number = Date.now()
): TickerItem[] {
  const candidates: TickerCandidate[] = [];
  const seen = new Set<string>();

  const push = (label: string, level: TickerItem["level"], at: number, priority: number) => {
    const key = label.slice(0, 48).toLowerCase();
    if (seen.has(key)) return;
    if (at > 0 && nowMs - at > TICKER_MAX_AGE_MS) return;
    seen.add(key);
    candidates.push({ label: label.toUpperCase(), level, at, priority });
  };

  const sortedIngest = [...ingestEvents].sort(
    (a, b) => parseOccurredAt(b.occurredAt) - parseOccurredAt(a.occurredAt)
  );
  for (const e of sortedIngest) {
    if (e.level === "normal") continue;
    push(
      eventTitle(e.summary, e.adapter),
      e.level,
      parseOccurredAt(e.occurredAt),
      e.level === "critical" ? 3 : 2
    );
  }

  const sortedAlerts = [...alerts]
    .filter((a) => a.status === "open")
    .sort((a, b) => {
      const atA = parseOccurredAt(a.timeline?.[0]?.at);
      const atB = parseOccurredAt(b.timeline?.[0]?.at);
      return atB - atA;
    });
  for (const a of sortedAlerts) {
    push(a.title, a.level, parseOccurredAt(a.timeline?.[0]?.at), a.level === "critical" ? 2 : 1);
  }

  const sortedStreams = [...streams]
    .filter((s) => s.level !== "normal")
    .sort((a, b) => b.score - a.score);
  for (const s of sortedStreams) {
    push(`${s.name} stream ${s.score}`, s.level, nowMs, 0);
  }

  candidates.sort((a, b) => b.priority - a.priority || b.at - a.at);

  const items = candidates.slice(0, TICKER_MAX_ITEMS).map((c) => ({
    label: c.label,
    level: c.level,
  }));

  if (items.length === 0) {
    return [{ label: "MONITORING LIVE FEEDS", level: "normal" as const }];
  }

  return items;
}

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

export function buildTickerFromAllSources(
  alerts: Alert[],
  streams: SignalStream[],
  ingestEvents: PersistedIngestEvent[]
): TickerItem[] {
  const items: TickerItem[] = [];
  const seen = new Set<string>();

  const push = (label: string, level: TickerItem["level"]) => {
    const key = label.slice(0, 48);
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ label, level });
  };

  for (const e of ingestEvents) {
    if (e.level === "normal") continue;
    push(eventTitle(e.summary, e.adapter).toUpperCase(), e.level);
  }
  for (const a of alerts) {
    if (a.status !== "open") continue;
    push(a.title.toUpperCase(), a.level);
  }
  for (const s of streams) {
    if (s.level === "normal") continue;
    push(s.name.toUpperCase(), s.level);
  }

  return items;
}

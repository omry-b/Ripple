import type { GeoProjection } from "d3-geo";
import type { Alert, Hotspot, SignalStream } from "@/types/domain";
import type { PersistedIngestEvent } from "@/lib/ingest/sync-risk";
import { ALERT_GEO, DEFAULT_MAP_CENTER, SIGNAL_GEO, type GeoPoint } from "./alert-locations";

export const MAP_WIDTH = 300;
export const MAP_HEIGHT = 150;
const MAX_MAP_HOTSPOTS = 48;

function legacyCxToLng(cx: number): number {
  return (cx / MAP_WIDTH) * 360 - 180;
}

function legacyCyToLat(cy: number): number {
  return 90 - (cy / MAP_HEIGHT) * 180;
}

export function resolveGeoForAlert(alert: Alert): GeoPoint {
  return (
    ALERT_GEO[alert.id] ?? {
      lng: DEFAULT_MAP_CENTER.lng,
      lat: DEFAULT_MAP_CENTER.lat,
      region: "APAC",
    }
  );
}

export function normalizeHotspotGeo(h: Hotspot): Hotspot {
  if (h.lng != null && h.lat != null && Number.isFinite(h.lng) && Number.isFinite(h.lat)) {
    return h;
  }
  const catalog = ALERT_GEO[h.alertId];
  if (catalog) {
    return { ...h, lng: catalog.lng, lat: catalog.lat, region: h.region ?? catalog.region };
  }
  return {
    ...h,
    lng: legacyCxToLng(h.cx),
    lat: legacyCyToLat(h.cy),
  };
}

function hotspotKey(h: { lng: number; lat: number; alertId: string }): string {
  return `${h.alertId}:${Math.round(h.lng * 10)}:${Math.round(h.lat * 10)}`;
}

export function buildHotspotsFromIngestEvents(events: PersistedIngestEvent[]): Hotspot[] {
  const seen = new Set<string>();
  const out: Hotspot[] = [];
  for (const e of events) {
    if (e.level === "normal" || e.lng == null || e.lat == null) continue;
    const key = hotspotKey({ lng: e.lng, lat: e.lat, alertId: e.id });
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      lng: e.lng,
      lat: e.lat,
      cx: 0,
      cy: 0,
      level: e.level,
      alertId: e.id,
      label: e.summary.slice(0, 72),
      region: e.region,
    });
  }
  return out;
}

export function buildHotspotsFromAlerts(alerts: Alert[]): Hotspot[] {
  const seen = new Set<string>();
  const out: Hotspot[] = [];
  for (const a of alerts) {
    if (a.status !== "open") continue;
    const geo = resolveGeoForAlert(a);
    const key = hotspotKey({ lng: geo.lng, lat: geo.lat, alertId: a.id });
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      lng: geo.lng,
      lat: geo.lat,
      cx: 0,
      cy: 0,
      level: a.level,
      alertId: a.id,
      label: a.title,
      region: geo.region,
    });
  }
  return out;
}

export function buildHotspotsFromStreams(
  streams: SignalStream[],
  existingKeys: Set<string>
): Hotspot[] {
  const out: Hotspot[] = [];
  for (const s of streams) {
    if (s.level !== "critical" && s.level !== "elevated") continue;
    const geo = SIGNAL_GEO[s.id] ?? DEFAULT_MAP_CENTER;
    const alertId = `signal-${s.id}`;
    const key = hotspotKey({ lng: geo.lng, lat: geo.lat, alertId });
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    out.push({
      lng: geo.lng,
      lat: geo.lat,
      cx: 0,
      cy: 0,
      level: s.level,
      alertId,
      label: s.name,
      region: geo.region,
    });
  }
  return out;
}

export function mergeHotspots(
  alerts: Alert[],
  streams: SignalStream[],
  ingestEvents: PersistedIngestEvent[] = []
): Hotspot[] {
  const fromIngest = buildHotspotsFromIngestEvents(ingestEvents);
  const keys = new Set(fromIngest.map((h) => hotspotKey(h)));
  const fromAlerts = buildHotspotsFromAlerts(alerts).filter((h) => {
    const k = hotspotKey(h);
    if (keys.has(k)) return false;
    keys.add(k);
    return true;
  });
  const fromStreams = buildHotspotsFromStreams(streams, keys);
  const merged = [...fromIngest, ...fromAlerts, ...fromStreams];
  return merged.slice(0, MAX_MAP_HOTSPOTS);
}

export function projectHotspotsToSvg(
  projection: GeoProjection,
  hotspots: Hotspot[]
): Hotspot[] {
  return hotspots.map((h) => {
    const normalized = normalizeHotspotGeo(h);
    const projected = projection([normalized.lng, normalized.lat]);
    if (!projected) return normalized;
    return {
      ...normalized,
      cx: projected[0],
      cy: projected[1],
    };
  });
}

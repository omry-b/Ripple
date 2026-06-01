import type { GeoProjection } from "d3-geo";
import type { Alert, Hotspot, SignalStream, TickerItem } from "@/types/domain";
import { ALERT_GEO, DEFAULT_MAP_CENTER, SIGNAL_GEO, type GeoPoint } from "./alert-locations";

export const MAP_WIDTH = 300;
export const MAP_HEIGHT = 150;

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

/** Backfill lng/lat on hotspots loaded from older snapshot JSON (cx/cy only). */
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

export function buildHotspotsFromAlerts(alerts: Alert[]): Hotspot[] {
  return alerts
    .filter((a) => a.status === "open")
    .slice(0, 8)
    .map((a) => {
      const geo = resolveGeoForAlert(a);
      return {
        lng: geo.lng,
        lat: geo.lat,
        cx: 0,
        cy: 0,
        level: a.level,
        alertId: a.id,
        label: a.title,
        region: geo.region,
      };
    });
}

/** Supplement map with elevated/critical streams (post-ingest scores). */
export function buildHotspotsFromStreams(
  streams: SignalStream[],
  existingAlertIds: Set<string>
): Hotspot[] {
  return streams
    .filter((s) => s.level === "critical" || s.level === "elevated")
    .filter((s) => !existingAlertIds.has(s.id))
    .slice(0, 3)
    .map((s) => {
      const geo = SIGNAL_GEO[s.id] ?? DEFAULT_MAP_CENTER;
      return {
        lng: geo.lng,
        lat: geo.lat,
        cx: 0,
        cy: 0,
        level: s.level,
        alertId: `signal-${s.id}`,
        label: s.name,
        region: geo.region,
      };
    });
}

export function mergeHotspots(alerts: Alert[], streams: SignalStream[]): Hotspot[] {
  const fromAlerts = buildHotspotsFromAlerts(alerts);
  const alertIds = new Set(fromAlerts.map((h) => h.alertId));
  const fromStreams = buildHotspotsFromStreams(streams, alertIds);
  const merged = [...fromAlerts, ...fromStreams];
  if (merged.length > 0) return merged;
  const fallback = ALERT_GEO.taiwan ?? DEFAULT_MAP_CENTER;
  return [
    {
      lng: fallback.lng,
      lat: fallback.lat,
      cx: 0,
      cy: 0,
      level: "critical",
      alertId: "taiwan",
      label: "Taiwan Strait",
      region: fallback.region,
    },
  ];
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

export function buildTickerFromAlertsAndStreams(
  alerts: Alert[],
  streams: SignalStream[]
): TickerItem[] {
  const items: TickerItem[] = [];
  for (const a of alerts) {
    if (a.status !== "open") continue;
    items.push({ label: a.title.toUpperCase(), level: a.level });
  }
  for (const s of streams) {
    if (s.level === "normal") continue;
    items.push({ label: s.name.toUpperCase(), level: s.level });
  }
  if (items.length > 0) return items.slice(0, 14);
  return [
    { label: "TAIWAN STRAIT", level: "critical" },
    { label: "AIS / SHIPPING", level: "critical" },
  ];
}

export function countLiveSignals(streams: SignalStream[]): number {
  const elevated = streams.filter((s) => s.level === "elevated" || s.level === "critical").length;
  return streams.length * 12 + elevated * 8;
}

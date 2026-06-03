import type { GeoRegion } from "@/types/domain";
import type { NormalizedIngestEvent } from "./types";
import { SIGNAL_GEO } from "@/lib/geo/alert-locations";

export function severityToLevel(severity: number): "critical" | "elevated" | "normal" {
  if (severity >= 70) return "critical";
  if (severity >= 45) return "elevated";
  return "normal";
}

export function regionFromLngLat(lng: number, lat: number): GeoRegion {
  if (lng >= -130 && lng <= -50 && lat >= 15 && lat <= 72) return "AMER";
  if (lng >= -25 && lng <= 60 && lat >= 35 && lat <= 72) return "EMEA";
  return "APAC";
}

export function enrichEventGeo(event: NormalizedIngestEvent): NormalizedIngestEvent {
  if (event.lng != null && event.lat != null) {
    return event;
  }
  const signalId = event.signalId ?? event.adapter;
  const anchor = SIGNAL_GEO[signalId] ?? SIGNAL_GEO[event.adapter];
  if (anchor) {
    return { ...event, lng: anchor.lng, lat: anchor.lat };
  }
  return {
    ...event,
    lng: -98 + (hashString(event.id) % 60),
    lat: 20 + (hashString(event.summary) % 40),
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h + s.charCodeAt(i) * 31) | 0;
  return Math.abs(h);
}

/** Centroid from NOAA GeoJSON feature geometry. */
export function lngLatFromGeoJsonGeometry(geometry: unknown): { lng: number; lat: number } | null {
  if (!geometry || typeof geometry !== "object") return null;
  const g = geometry as { type?: string; coordinates?: unknown };
  if (g.type === "Point" && Array.isArray(g.coordinates) && g.coordinates.length >= 2) {
    return { lng: Number(g.coordinates[0]), lat: Number(g.coordinates[1]) };
  }
  if (g.type === "Polygon" && Array.isArray(g.coordinates)) {
    const ring = g.coordinates[0] as number[][] | undefined;
    if (!ring?.length) return null;
    let lngSum = 0;
    let latSum = 0;
    let n = 0;
    for (const c of ring.slice(0, 24)) {
      if (c.length >= 2) {
        lngSum += c[0];
        latSum += c[1];
        n += 1;
      }
    }
    if (n === 0) return null;
    return { lng: lngSum / n, lat: latSum / n };
  }
  return null;
}

export function eventTitle(summary: string, _adapter: string): string {
  const trimmed = summary.trim();
  if (trimmed.length <= 72) return trimmed;
  return `${trimmed.slice(0, 69)}...`;
}

import type { GeoRegion } from "@/types/domain";

export type GeoPoint = {
  lng: number;
  lat: number;
  region: GeoRegion;
};

/** WGS84 anchors for demo alerts and signal streams (ingest + map). */
export const ALERT_GEO: Record<string, GeoPoint> = {
  taiwan: { lng: 121.0, lat: 24.5, region: "APAC" },
  "sea-port": { lng: 103.85, lat: 1.29, region: "APAC" },
  "tsmc-signal": { lng: 120.97, lat: 24.78, region: "APAC" },
};

export const SIGNAL_GEO: Record<string, GeoPoint> = {
  ais: { lng: 119.5, lat: 24.0, region: "APAC" },
  geo: { lng: 121.5, lat: 25.0, region: "APAC" },
  port: { lng: 103.85, lat: 1.29, region: "APAC" },
  financial: { lng: 121.5, lat: 31.2, region: "APAC" },
  weather: { lng: 120.0, lat: 23.5, region: "APAC" },
  commodity: { lng: -74.0, lat: 40.7, region: "AMER" },
  freight: { lng: 4.48, lat: 51.92, region: "EMEA" },
};

export const DEFAULT_MAP_CENTER: GeoPoint = {
  lng: 25,
  lat: 20,
  region: "APAC",
};

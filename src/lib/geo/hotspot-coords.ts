import type { Hotspot } from "@/types/domain";
import { normalizeHotspotGeo } from "./hotspots";

/** WGS84 coordinates for Mapbox markers. */
export function hotspotToLngLat(h: Hotspot): [number, number] {
  const n = normalizeHotspotGeo(h);
  return [n.lng, n.lat];
}

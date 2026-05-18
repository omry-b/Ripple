import type { Hotspot } from "@/types/domain";

/** Map SVG hotspot coords (300×150) to approximate lng/lat. */
export function hotspotToLngLat(h: Hotspot): [number, number] {
  const lng = (h.cx / 300) * 360 - 180;
  const lat = 90 - (h.cy / 150) * 180;
  return [lng, lat];
}

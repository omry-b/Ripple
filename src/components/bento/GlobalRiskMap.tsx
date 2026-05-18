"use client";

import dynamic from "next/dynamic";
import type { Hotspot } from "@/types/domain";
import { WorldTopoMap } from "@/components/bento/WorldTopoMap";

const MapboxRiskMap = dynamic(
  () => import("@/components/bento/MapboxRiskMap").then((m) => m.MapboxRiskMap),
  { ssr: false, loading: () => <WorldTopoMap hotspots={[]} /> }
);

type GlobalRiskMapProps = {
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
};

export function GlobalRiskMap({ hotspots, onHotspotClick }: GlobalRiskMapProps) {
  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return <MapboxRiskMap hotspots={hotspots} onHotspotClick={onHotspotClick} />;
  }
  return <WorldTopoMap hotspots={hotspots} onHotspotClick={onHotspotClick} />;
}

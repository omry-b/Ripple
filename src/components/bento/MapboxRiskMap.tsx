"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Hotspot } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import { hotspotToLngLat } from "@/lib/geo/hotspot-coords";
import { WorldTopoMap } from "@/components/bento/WorldTopoMap";

type MapboxRiskMapProps = {
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
};

export function MapboxRiskMap({ hotspots, onHotspotClick }: MapboxRiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<Hotspot | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current || failed) return;

    let cancelled = false;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = token;
        const map =
          mapRef.current ??
          new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [118, 22],
            zoom: 2.2,
            attributionControl: false,
          });

        mapRef.current = map;

        const placeMarkers = () => {
          for (const m of markersRef.current) m.remove();
          markersRef.current = [];
          for (const h of hotspots) {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "mapbox-hotspot-marker";
            el.style.background = LEVEL_COLOR[h.level];
            el.setAttribute("aria-label", h.label);
            el.onclick = () => onHotspotClick?.(h);
            el.onmouseenter = () => setHovered(h);
            el.onmouseleave = () => setHovered(null);
            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat(hotspotToLngLat(h))
              .addTo(map);
            markersRef.current.push(marker);
          }
        };

        if (map.loaded()) placeMarkers();
        else map.once("load", placeMarkers);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, hotspots, onHotspotClick, failed]);

  useEffect(() => {
    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (!token || failed) {
    return <WorldTopoMap hotspots={hotspots} onHotspotClick={onHotspotClick} />;
  }

  return (
    <div className="map-wrap map-wrap-mapbox">
      {hovered && (
        <div className="map-tooltip map-tooltip-mapbox">
          <span className="map-tooltip-label">{hovered.label}</span>
          <Link
            href={
              hovered.alertId.startsWith("signal-")
                ? "/signals"
                : `/companies?alert=${hovered.alertId}`
            }
            className="map-tooltip-link"
          >
            {hovered.alertId.startsWith("signal-") ? "View signals →" : "View exposure →"}
          </Link>
        </div>
      )}
      <div ref={containerRef} className="mapbox-container" aria-label="Mapbox global risk map" />
    </div>
  );
}

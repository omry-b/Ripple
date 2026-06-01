"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { geoPath, geoNaturalEarth1, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import type { Hotspot } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  normalizeHotspotGeo,
  projectHotspotsToSvg,
} from "@/lib/geo/hotspots";

type WorldTopoMapProps = {
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
};

export function WorldTopoMap({ hotspots, onHotspotClick }: WorldTopoMapProps) {
  const [hovered, setHovered] = useState<Hotspot | null>(null);
  const [landPaths, setLandPaths] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [projection, setProjection] = useState<GeoProjection | null>(null);

  const pathGen = useMemo(
    () => (projection ? geoPath(projection) : null),
    [projection]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
        );
        if (!res.ok) throw new Error("TopoJSON fetch failed");
        const topology = (await res.json()) as Topology;
        const countries = feature(
          topology,
          topology.objects.countries as never
        ) as unknown as FeatureCollection<Geometry>;
        const proj = geoNaturalEarth1().translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
        proj.fitSize([MAP_WIDTH, MAP_HEIGHT], countries);
        const d = geoPath(proj)(countries);
        if (!cancelled) {
          setProjection(() => proj);
          setLandPaths(d ?? "");
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plottedHotspots = useMemo(() => {
    const normalized = hotspots.map(normalizeHotspotGeo);
    if (!projection) return normalized;
    return projectHotspotsToSvg(projection, normalized);
  }, [hotspots, projection]);

  return (
    <div className="map-wrap">
      {hovered && (
        <div
          className="map-tooltip"
          style={{
            left: `${(hovered.cx / MAP_WIDTH) * 100}%`,
            top: `${(hovered.cy / MAP_HEIGHT) * 100}%`,
          }}
        >
          <span className="map-tooltip-level" style={{ color: LEVEL_COLOR[hovered.level] }}>
            {hovered.level.toUpperCase()}
          </span>
          <span className="map-tooltip-label">{hovered.label}</span>
          <span className="map-tooltip-hint">Click to view exposure</span>
          <Link
            href={
              hovered.alertId.startsWith("signal-")
                ? "/signals"
                : `/companies?alert=${hovered.alertId}`
            }
            className="map-tooltip-link"
            onClick={(e) => e.stopPropagation()}
          >
            {hovered.alertId.startsWith("signal-")
              ? "View signal stream →"
              : "View alert exposure →"}
          </Link>
        </div>
      )}
      <svg
        className="map-container map-container-topo"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        aria-label="World map with supply chain risk hotspots"
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#0D0D0D" />
        {landPaths && pathGen ? (
          <path d={landPaths} className="map-land-mesh" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth={0.4} />
        ) : loadError ? (
          <text x={MAP_WIDTH / 2} y={MAP_HEIGHT / 2} textAnchor="middle" fill="#525252" fontSize={10}>
            Map unavailable
          </text>
        ) : (
          <text x={MAP_WIDTH / 2} y={MAP_HEIGHT / 2} textAnchor="middle" fill="#525252" fontSize={10}>
            Loading map…
          </text>
        )}
        {plottedHotspots.map((h) => (
          <g
            key={h.alertId}
            className={onHotspotClick ? "map-hotspot-interactive" : undefined}
            style={{ cursor: onHotspotClick ? "pointer" : undefined }}
            onClick={onHotspotClick ? () => onHotspotClick(h) : undefined}
            onMouseEnter={() => setHovered(h)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(h)}
            onBlur={() => setHovered(null)}
            onKeyDown={
              onHotspotClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onHotspotClick(h);
                    }
                  }
                : undefined
            }
            role={onHotspotClick ? "button" : undefined}
            tabIndex={onHotspotClick ? 0 : undefined}
            aria-label={
              onHotspotClick
                ? `${h.label}  -  ${h.level} risk at ${h.lat.toFixed(1)}°, ${h.lng.toFixed(1)}°. Click for exposure.`
                : undefined
            }
          >
            <title>{`${h.label} (${h.lat.toFixed(1)}°N, ${h.lng.toFixed(1)}°E)`}</title>
            <circle
              cx={h.cx}
              cy={h.cy}
              r={h.level === "critical" ? 6 : 4}
              fill={LEVEL_COLOR[h.level]}
              opacity={0.85}
            />
            {h.level === "critical" && (
              <circle
                cx={h.cx}
                cy={h.cy}
                r={10}
                fill="none"
                stroke={LEVEL_COLOR[h.level]}
                strokeWidth={1}
                opacity={0.4}
                className="map-pulse-ring"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

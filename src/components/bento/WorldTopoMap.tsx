"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import type { Hotspot } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";

type WorldTopoMapProps = {
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
};

const WIDTH = 300;
const HEIGHT = 150;

export function WorldTopoMap({ hotspots, onHotspotClick }: WorldTopoMapProps) {
  const [hovered, setHovered] = useState<Hotspot | null>(null);
  const [landPaths, setLandPaths] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const projection = useMemo(() => geoNaturalEarth1().translate([WIDTH / 2, HEIGHT / 2]), []);
  const pathGen = useMemo(() => geoPath(projection), [projection]);

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
        projection.fitSize([WIDTH, HEIGHT], countries);
        const d = pathGen(countries);
        if (!cancelled) setLandPaths(d ?? "");
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathGen, projection]);

  return (
    <div className="map-wrap">
      {hovered && (
        <div
          className="map-tooltip"
          style={{
            left: `${(hovered.cx / WIDTH) * 100}%`,
            top: `${(hovered.cy / HEIGHT) * 100}%`,
          }}
        >
          <span className="map-tooltip-level" style={{ color: LEVEL_COLOR[hovered.level] }}>
            {hovered.level.toUpperCase()}
          </span>
          <span className="map-tooltip-label">{hovered.label}</span>
          <span className="map-tooltip-hint">Click to filter {hovered.region}</span>
          <Link
            href={`/companies?alert=${hovered.alertId}`}
            className="map-tooltip-link"
            onClick={(e) => e.stopPropagation()}
          >
            View alert exposure →
          </Link>
        </div>
      )}
      <svg
        className="map-container map-container-topo"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-label="World map with supply chain risk hotspots"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#0D0D0D" />
        {landPaths ? (
          <path d={landPaths} className="map-land-mesh" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth={0.4} />
        ) : loadError ? (
          <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#525252" fontSize={10}>
            Map unavailable
          </text>
        ) : (
          <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="#525252" fontSize={10}>
            Loading map…
          </text>
        )}
        {hotspots.map((h) => (
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
                ? `${h.label} — ${h.level} risk. Click to filter ${h.region}.`
                : undefined
            }
          >
            <title>{h.label}</title>
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

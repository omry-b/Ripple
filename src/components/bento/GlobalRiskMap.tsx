"use client";

import Link from "next/link";
import { useState } from "react";
import type { Hotspot } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";

type GlobalRiskMapProps = {
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
};

export function GlobalRiskMap({ hotspots, onHotspotClick }: GlobalRiskMapProps) {
  const [hovered, setHovered] = useState<Hotspot | null>(null);

  return (
    <div className="map-wrap">
      {hovered && (
        <div
          className="map-tooltip"
          style={{
            left: `${(hovered.cx / 300) * 100}%`,
            top: `${(hovered.cy / 150) * 100}%`,
          }}
        >
          <span
            className="map-tooltip-level"
            style={{ color: LEVEL_COLOR[hovered.level] }}
          >
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
        className="map-container"
        viewBox="0 0 300 150"
        aria-label="Global risk map tracking supply chain disruptions"
      >
        <rect width="300" height="150" fill="#0D0D0D" />
        <line x1="0" y1="75" x2="300" y2="75" className="map-grid-line" />
        <line x1="150" y1="0" x2="150" y2="150" className="map-grid-line" />
        <g className="map-continent">
          <ellipse cx="60" cy="55" rx="35" ry="22" />
          <ellipse cx="85" cy="95" rx="20" ry="18" />
          <ellipse cx="165" cy="45" rx="30" ry="24" />
          <ellipse cx="235" cy="50" rx="28" ry="18" />
          <ellipse cx="180" cy="95" rx="16" ry="20" />
          <ellipse cx="255" cy="105" rx="14" ry="10" />
        </g>
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
              r={h.level === "critical" ? 18 : 14}
              fill={LEVEL_COLOR[h.level]}
              opacity={0.06}
              className="pulse-ring"
            />
            <circle
              cx={h.cx}
              cy={h.cy}
              r={h.level === "critical" ? 6 : 5}
              fill={LEVEL_COLOR[h.level]}
              opacity={0.18}
            />
            <circle
              cx={h.cx}
              cy={h.cy}
              r={h.level === "critical" ? 2.5 : 2}
              fill={LEVEL_COLOR[h.level]}
              opacity={h.level === "critical" ? 0.95 : 0.85}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

"use client";

import type { Hotspot } from "@/types/domain";
import { GlobalRiskMap } from "./GlobalRiskMap";

type MapFullscreenModalProps = {
  hotspots: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
  legend: { critical: boolean; elevated: boolean };
  onClose: () => void;
};

export function MapFullscreenModal({
  hotspots,
  onHotspotClick,
  legend,
  onClose,
}: MapFullscreenModalProps) {
  const visible = hotspots.filter(
    (h) =>
      (h.level === "critical" && legend.critical) ||
      (h.level === "elevated" && legend.elevated) ||
      h.level === "normal"
  );

  return (
    <>
      <button type="button" className="modal-backdrop" aria-label="Close map" onClick={onClose} />
      <div className="map-fullscreen-panel" role="dialog" aria-label="Fullscreen risk map">
        <div className="map-fullscreen-header">
          <span className="card-title">Global Risk Map</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <GlobalRiskMap hotspots={visible} onHotspotClick={onHotspotClick} />
      </div>
    </>
  );
}

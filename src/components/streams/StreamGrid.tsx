"use client";

import Link from "next/link";
import type { SignalStream } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import { useCardSpotlight } from "@/lib/hooks";

type StreamGridProps = {
  streams: SignalStream[];
  linkToSignals?: boolean;
  onStreamSelect?: (stream: SignalStream) => void;
  selectedId?: string | null;
  compareMode?: boolean;
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
};

export function StreamGrid({
  streams,
  linkToSignals = false,
  onStreamSelect,
  selectedId,
  compareMode = false,
  compareIds = [],
  onToggleCompare,
}: StreamGridProps) {
  const spotlightIds = streams.map((s) => `stream-card-${s.id}`);
  useCardSpotlight(spotlightIds);

  return (
    <section className="stream-grid reveal">
      {streams.map((stream) => {
        const isSelected = selectedId === stream.id;
        const isCompareSelected = compareIds.includes(stream.id);
        const interactive = Boolean(onStreamSelect) || Boolean(onToggleCompare);

        return (
          <div
            key={stream.id}
            id={`stream-card-${stream.id}`}
            className={`stream-card${interactive ? " stream-card-interactive" : ""}${isSelected || isCompareSelected ? " stream-card-selected" : ""}`}
            role={onStreamSelect && !compareMode ? "button" : undefined}
            tabIndex={onStreamSelect && !compareMode ? 0 : undefined}
            onClick={
              compareMode
                ? () => onToggleCompare?.(stream.id)
                : onStreamSelect
                  ? () => onStreamSelect(stream)
                  : undefined
            }
            onKeyDown={
              onStreamSelect && !compareMode
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onStreamSelect(stream);
                    }
                  }
                : undefined
            }
          >
            {compareMode && (
              <span className="stream-compare-badge">
                {isCompareSelected ? "✓ Selected" : "Click to compare"}
              </span>
            )}
            <div className="stream-header">
              <span className="stream-name">{stream.name}</span>
              <span
                className={`stream-score ${stream.level === "critical" ? "critical-text" : stream.level === "elevated" ? "elevated-text" : "normal-text"}`}
              >
                {stream.score}
                <span style={{ fontSize: 9, color: "#404040" }}>/100</span>
              </span>
            </div>
            <svg width="100%" height="20" viewBox="0 0 100 20" style={{ display: "block", margin: "6px 0" }}>
              <polyline
                points={stream.sparkline}
                fill="none"
                stroke={LEVEL_COLOR[stream.level]}
                strokeWidth="1.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="stream-meta-row">
              <span
                className={`stream-badge ${
                  stream.level === "critical"
                    ? "critical-bg"
                    : stream.level === "elevated"
                      ? "elevated-bg"
                      : "normal-bg"
                }`}
              >
                {stream.level.toUpperCase()}
              </span>
              <span className="stream-time">{stream.time}</span>
            </div>
            {linkToSignals && (
              <Link
                href="/signals"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 9,
                  color: "#3B82F6",
                  marginTop: 8,
                  display: "inline-block",
                  textDecoration: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                All signals →
              </Link>
            )}
          </div>
        );
      })}
    </section>
  );
}

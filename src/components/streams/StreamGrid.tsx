"use client";

import Link from "next/link";
import type { SignalStream } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";
import { useCardSpotlight } from "@/lib/hooks";

type StreamGridProps = {
  streams: SignalStream[];
  linkToSignals?: boolean;
};

export function StreamGrid({ streams, linkToSignals = false }: StreamGridProps) {
  const spotlightIds = streams.map((_, i) => `stream-card-${i + 1}`);
  useCardSpotlight(spotlightIds);

  return (
    <section className="stream-grid reveal">
      {streams.map((stream, i) => (
        <div key={stream.id} className="stream-card" id={`stream-card-${i + 1}`}>
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
            >
              All signals →
            </Link>
          )}
        </div>
      ))}
    </section>
  );
}

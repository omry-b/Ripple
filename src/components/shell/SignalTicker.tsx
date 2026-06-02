"use client";

import { useEffect, useRef } from "react";
import type { TickerItem } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";

/** Pixels per second — lower = slower crawl. */
const TICKER_PX_PER_SEC = 24;
const TICKER_MIN_DURATION_SEC = 90;

type SignalTickerProps = {
  items: TickerItem[];
};

function TickerSegment({ items }: { items: TickerItem[] }) {
  return (
    <div className="ticker-segment">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} style={{ display: "contents" }}>
          <div className="ticker-item">
            <span className="ticker-dot" style={{ color: LEVEL_COLOR[item.level] }}>
              ●
            </span>
            <span className="ticker-label">{item.label}</span>
            <span style={{ color: LEVEL_COLOR[item.level] }}>
              {item.level.toUpperCase()}
            </span>
          </div>
          <span className="ticker-divider">│</span>
        </span>
      ))}
    </div>
  );
}

export function SignalTicker({ items }: SignalTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;

    const applyDuration = () => {
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth <= 0) return;
      const durationSec = Math.max(TICKER_MIN_DURATION_SEC, halfWidth / TICKER_PX_PER_SEC);
      track.style.setProperty("--ticker-duration", `${durationSec}s`);
    };

    applyDuration();
    const ro = new ResizeObserver(applyDuration);
    ro.observe(track);
    return () => ro.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="ticker-viewport" aria-live="polite">
      <div className="ticker-fade-left" />
      <div className="ticker-fade-right" />
      <div className="ticker-track" ref={trackRef}>
        <TickerSegment items={items} />
        <TickerSegment items={items} />
      </div>
    </div>
  );
}

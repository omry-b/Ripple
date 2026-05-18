import type { TickerItem } from "@/types/domain";
import { LEVEL_COLOR } from "@/types/domain";

type SignalTickerProps = {
  items: TickerItem[];
};

function TickerSegment({ items }: { items: TickerItem[] }) {
  return (
    <div className="ticker-segment">
      {items.map((item) => (
        <span key={item.label} style={{ display: "contents" }}>
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
  return (
    <div className="ticker-viewport" aria-live="polite">
      <div className="ticker-fade-left" />
      <div className="ticker-fade-right" />
      <div className="ticker-track">
        <TickerSegment items={items} />
        <TickerSegment items={items} />
      </div>
    </div>
  );
}

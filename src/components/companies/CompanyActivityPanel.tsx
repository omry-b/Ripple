"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CompanyActivityItem } from "@/lib/companies/activity";
import { formatAsOf } from "@/lib/format";

type CompanyActivityPanelProps = {
  companyId: string;
  companyName: string;
};

const KIND_LABEL: Record<CompanyActivityItem["kind"], string> = {
  alert: "Alert",
  ingest: "Live ingest",
  signal: "Signal",
};

export function CompanyActivityPanel({
  companyId,
  companyName,
}: CompanyActivityPanelProps) {
  const [items, setItems] = useState<CompanyActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/companies/${companyId}/activity`);
        const raw = (await res.json()) as Record<string, unknown>;
        if (!res.ok || cancelled) return;
        const data = (raw.data ?? raw) as { items: CompanyActivityItem[] };
        setItems(data.items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return (
    <section className="surface-panel company-activity-panel">
      <p className="company-stories-intro">
        Unified timeline for {companyName}: open alerts, live ingest headlines, and elevated
        signals.
      </p>
      {loading ? (
        <p className="company-stories-empty">Loading activity…</p>
      ) : items.length === 0 ? (
        <p className="company-stories-empty">No recent activity matched this company.</p>
      ) : (
        <ul className="timeline-feed">
          {items.map((item) => (
            <li
              key={item.id}
              className={`timeline-feed-item timeline-feed-item--${item.level}`}
            >
              <div className="company-activity-meta">
                <span className="company-stories-badge">{KIND_LABEL[item.kind]}</span>
                <span className={`risk-pill risk-pill--${item.level}`}>{item.level}</span>
                <time dateTime={item.at}>{formatAsOf(item.at)}</time>
              </div>
              <p className="company-activity-title">{item.title}</p>
              <p className="company-stories-summary">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/intelligence" className="text-link">
        Portfolio intelligence feed →
      </Link>
    </section>
  );
}

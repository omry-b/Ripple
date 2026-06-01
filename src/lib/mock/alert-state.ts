import type { Alert, AlertStatus, SignalStream } from "@/types/domain";
import { eventTitle, severityToLevel } from "@/lib/ingest/geo-utils";
import type { NormalizedIngestEvent } from "@/lib/ingest/types";

const INITIAL: Alert[] = [
  {
    id: "taiwan",
    level: "critical",
    status: "open",
    critical: true,
    statusLabel: "● CRITICAL STATE",
    title: "Taiwan Strait",
    detail:
      "Geopolitical tension + AIS vessel anomaly detected across primary maritime shipping lanes.",
    meta: "34 companies · CVaR₉₅ $2.1B · +8.1 pts today",
    affectedCompanyIds: ["apple", "tsmc", "foxconn", "qualcomm", "nvidia"],
    timeline: [
      { at: "2026-05-17T14:00:00Z", event: "AIS anomaly cluster detected in strait corridor" },
      { at: "2026-05-17T09:30:00Z", event: "Geopolitical escalation index crossed critical threshold" },
      { at: "2026-05-16T22:00:00Z", event: "Alert opened · maritime advisory issued" },
    ],
  },
  {
    id: "sea-port",
    level: "elevated",
    status: "open",
    statusLabel: "● ELEVATED EXPOSURE",
    title: "SEA Port Congestion",
    detail:
      "Port yard congestion multiplying across regional hubs. Severe weather patterns compounding delays.",
    meta: "18 companies · +11.2d avg delay · $0.8B exposure",
    affectedCompanyIds: ["foxconn", "samsung", "qualcomm"],
    timeline: [
      { at: "2026-05-17T11:00:00Z", event: "Dwell times exceeded P90 at Singapore hub" },
      { at: "2026-05-17T06:00:00Z", event: "Congestion index elevated across ASEAN ports" },
    ],
  },
  {
    id: "tsmc-signal",
    level: "elevated",
    status: "open",
    statusLabel: "● ELEVATED EXPOSURE",
    title: "TSMC Financial Signal",
    detail:
      "Distress model variance discovered: underlying earnings compression signals matching recruitment drawdowns.",
    meta: "12 companies · CVaR₉₅ $0.3B · Tier 2 primarily",
    affectedCompanyIds: ["tsmc", "apple", "nvidia", "amd"],
    timeline: [
      { at: "2026-05-17T08:00:00Z", event: "Financial distress z-score breach" },
      { at: "2026-05-16T18:00:00Z", event: "Hiring velocity drawdown signal matched" },
    ],
  },
];

let alerts: Alert[] = INITIAL.map((a) => ({ ...a, timeline: [...a.timeline] }));

export const alertState = {
  list(): Alert[] {
    return alerts.map((a) => ({ ...a, timeline: [...a.timeline] }));
  },

  get(id: string): Alert | undefined {
    const a = alerts.find((x) => x.id === id);
    return a ? { ...a, timeline: [...a.timeline] } : undefined;
  },

  acknowledge(id: string): Alert | null {
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    alerts[idx] = {
      ...alerts[idx],
      status: "acknowledged",
      statusLabel:
        alerts[idx].level === "critical" ? "● CRITICAL · ACK" : "● ELEVATED · ACK",
      timeline: [
        { at: new Date().toISOString(), event: "Acknowledged by analyst" },
        ...alerts[idx].timeline,
      ],
    };
    return alertState.get(id) ?? null;
  },

  resolve(id: string): Alert | null {
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    alerts[idx] = {
      ...alerts[idx],
      status: "resolved",
      statusLabel: "● RESOLVED",
      timeline: [
        { at: new Date().toISOString(), event: "Resolved by analyst" },
        ...alerts[idx].timeline,
      ],
    };
    return alertState.get(id) ?? null;
  },

  setStatus(id: string, status: AlertStatus): Alert | null {
    if (status === "acknowledged") return alertState.acknowledge(id);
    if (status === "resolved") return alertState.resolve(id);
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    alerts[idx] = { ...alerts[idx], status };
    return alertState.get(id) ?? null;
  },

  mergeFromIngest(events: NormalizedIngestEvent[], streams: SignalStream[]): void {
    for (const e of events) {
      const level = severityToLevel(e.severity);
      const signalId = e.signalId ?? e.adapter;
      const stream = streams.find((s) => s.id === signalId);
      const affected = stream?.relatedCompanyIds ?? [];
      const row: Alert = {
        id: e.id,
        level,
        status: "open",
        statusLabel: level === "critical" ? "● CRITICAL STATE" : "● ELEVATED EXPOSURE",
        title: eventTitle(e.summary, e.adapter),
        detail: e.summary,
        meta: `${e.adapter.toUpperCase()} · severity ${e.severity}`,
        critical: level === "critical",
        affectedCompanyIds: affected,
        timeline: [{ at: e.occurredAt, event: `Ingest: ${e.adapter}` }],
      };
      const idx = alerts.findIndex((a) => a.id === e.id);
      if (idx >= 0) alerts[idx] = row;
      else alerts.unshift(row);
    }
    if (alerts.length > 120) alerts.length = 120;
  },
};

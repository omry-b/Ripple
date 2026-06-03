import { getAlertsForCompany, getSignalsForCompany } from "@/lib/api";
import { loadRecentIngestEvents } from "@/lib/ingest/sync-risk";
import type { Alert, SignalStream } from "@/types/domain";

export type CompanyActivityItem = {
  id: string;
  at: string;
  kind: "alert" | "ingest" | "signal";
  title: string;
  detail: string;
  level: "critical" | "elevated" | "normal";
};

function companyNameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function textMatchesCompany(text: string, tokens: string[]): boolean {
  const lower = text.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

export async function getCompanyActivity(
  companyId: string,
  companyName: string
): Promise<{ items: CompanyActivityItem[]; alerts: Alert[]; signals: SignalStream[] }> {
  const [alerts, signals, ingestEvents] = await Promise.all([
    getAlertsForCompany(companyId),
    getSignalsForCompany(companyId),
    loadRecentIngestEvents(120),
  ]);

  const tokens = companyNameTokens(companyName);
  const items: CompanyActivityItem[] = [];

  for (const alert of alerts.slice(0, 12)) {
    items.push({
      id: `alert-${alert.id}`,
      at: alert.timeline[0]?.at ?? new Date().toISOString(),
      kind: "alert",
      title: alert.title,
      detail: alert.detail,
      level: alert.level,
    });
  }

  for (const event of ingestEvents) {
    if (!textMatchesCompany(event.summary, tokens)) continue;
    items.push({
      id: `ingest-${event.id}`,
      at: event.occurredAt,
      kind: "ingest",
      title: event.summary,
      detail: `${event.adapter.toUpperCase()} · severity ${event.severity}`,
      level: event.level,
    });
  }

  for (const signal of signals.filter((s) => s.level !== "normal").slice(0, 6)) {
    items.push({
      id: `signal-${signal.id}`,
      at: new Date().toISOString(),
      kind: "signal",
      title: signal.name,
      detail: `Score ${signal.score} · ${signal.description}`,
      level: signal.level,
    });
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    items: items.slice(0, 20),
    alerts,
    signals,
  };
}

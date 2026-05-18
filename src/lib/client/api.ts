import type {
  Alert,
  Company,
  CommandItem,
  DashboardPayload,
  DashboardSnapshot,
  Scenario,
  SignalStream,
  SimulationRun,
} from "@/types/domain";

import { fetchJsonWithRetry } from "@/lib/client/fetch-retry";

function unwrapApi<T>(raw: Record<string, unknown>): T {
  if (raw.data !== undefined && typeof raw.data === "object" && raw.data !== null) {
    return { asOf: raw.asOf, ...(raw.data as Record<string, unknown>) } as T;
  }
  return raw as T;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const raw = await fetchJsonWithRetry<Record<string, unknown>>(path, init);
  return unwrapApi<T>(raw);
}

export function fetchDashboard(): Promise<DashboardPayload> {
  return fetchJson("/api/dashboard");
}

export function fetchSnapshot(): Promise<{ asOf: string; snapshot: DashboardSnapshot }> {
  return fetchJson("/api/snapshot");
}

export function fetchSignals(): Promise<{ asOf: string; signals: SignalStream[] }> {
  return fetchJson("/api/signals");
}

export function fetchCompanies(): Promise<{ asOf: string; companies: Company[] }> {
  return fetchJson("/api/companies");
}

export function fetchAlerts(): Promise<{ asOf: string; alerts: Alert[] }> {
  return fetchJson("/api/alerts");
}

export function fetchScenarios(): Promise<{ asOf: string; scenarios: Scenario[] }> {
  return fetchJson("/api/scenarios");
}

export function fetchCompany(id: string): Promise<{ asOf: string; company: Company }> {
  return fetchJson(`/api/companies/${id}`);
}

export type ScenarioJob = {
  id: string;
  scenarioId: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  error?: string;
  run?: SimulationRun;
};

export function runScenarioApi(
  id: string,
  options?: { severity?: number; durationDays?: number; cvarLevel?: 95 | 99 }
): Promise<{ asOf: string; run: SimulationRun }> {
  return fetchJson(`/api/scenarios/${id}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options ?? {}),
  });
}

export function runScenarioAsyncApi(
  id: string,
  options?: { severity?: number; durationDays?: number; cvarLevel?: 95 | 99 }
): Promise<{ asOf: string; job: ScenarioJob }> {
  return fetchJson(`/api/scenarios/${id}/run?async=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...options, async: true }),
  });
}

export function fetchScenarioJob(
  jobId: string
): Promise<{ asOf: string; job: ScenarioJob }> {
  return fetchJson(`/api/scenarios/jobs/${jobId}`);
}

export function fetchSimulationRuns(): Promise<{ asOf: string; runs: SimulationRun[] }> {
  return fetchJson("/api/scenarios/runs");
}

export function fetchSearch(): Promise<{ asOf: string; items: CommandItem[] }> {
  return fetchJson("/api/search");
}

export function acknowledgeAlertApi(
  id: string
): Promise<{ asOf: string; alert: Alert }> {
  return fetchJson(`/api/alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "acknowledge" }),
  });
}

export function resolveAlertApi(id: string): Promise<{ asOf: string; alert: Alert }> {
  return fetchJson(`/api/alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resolve" }),
  });
}

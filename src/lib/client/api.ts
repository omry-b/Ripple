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

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchJsonWithRetry<T>(path, init);
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

export function runScenarioApi(
  id: string,
  options?: { severity?: number; durationDays?: number }
): Promise<{ asOf: string; run: SimulationRun }> {
  return fetchJson(`/api/scenarios/${id}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options ?? {}),
  });
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

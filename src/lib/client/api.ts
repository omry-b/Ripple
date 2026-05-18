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

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
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
  id: string
): Promise<{ asOf: string; run: SimulationRun }> {
  return fetchJson(`/api/scenarios/${id}/run`, { method: "POST" });
}

export function fetchSimulationRuns(): Promise<{ asOf: string; runs: SimulationRun[] }> {
  return fetchJson("/api/scenarios/runs");
}

export function fetchSearch(): Promise<{ asOf: string; items: CommandItem[] }> {
  return fetchJson("/api/search");
}

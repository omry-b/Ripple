import { mockStore } from "@/lib/mock/store";
import { simulationRunStore } from "@/lib/mock/simulation-runs";
import type {
  Alert,
  Company,
  DashboardPayload,
  DashboardSnapshot,
  Scenario,
  SignalStream,
  SimulationRun,
  TickerItem,
} from "@/types/domain";

export async function getDashboard(): Promise<DashboardPayload> {
  return mockStore.getDashboard();
}

export async function getSnapshot(): Promise<DashboardSnapshot> {
  return mockStore.getSnapshot();
}

export async function getTicker(): Promise<TickerItem[]> {
  return mockStore.getTicker();
}

export async function getSignals(): Promise<SignalStream[]> {
  return mockStore.getSignals();
}

export async function getCompanies(): Promise<Company[]> {
  return mockStore.getCompanies();
}

export async function getCompany(id: string): Promise<Company | null> {
  return mockStore.getCompany(id) ?? null;
}

export async function getAlerts(): Promise<Alert[]> {
  return mockStore.getAlerts();
}

export async function getAlert(id: string): Promise<Alert | null> {
  return mockStore.getAlert(id) ?? null;
}

export async function getScenarios(): Promise<Scenario[]> {
  return mockStore.getScenarios();
}

export async function getScenario(id: string): Promise<Scenario | null> {
  return mockStore.getScenario(id) ?? null;
}

export async function runScenario(id: string): Promise<SimulationRun | null> {
  const scenario = mockStore.getScenario(id);
  if (!scenario) return null;
  return simulationRunStore.run(scenario);
}

export async function getSimulationRuns(): Promise<SimulationRun[]> {
  return simulationRunStore.list();
}

export async function getAlertsForCompany(companyId: string): Promise<Alert[]> {
  return mockStore.getAlertsForCompany(companyId);
}

export async function getSignalsForCompany(companyId: string): Promise<SignalStream[]> {
  return mockStore.getSignalsForCompany(companyId);
}

export async function getSearchIndex() {
  return mockStore.getSearchIndex();
}

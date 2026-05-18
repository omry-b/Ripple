import { mockStore } from "@/lib/mock/store";
import type {
  Alert,
  Company,
  DashboardPayload,
  DashboardSnapshot,
  Scenario,
  SignalStream,
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

export async function getScenarios(): Promise<Scenario[]> {
  return mockStore.getScenarios();
}

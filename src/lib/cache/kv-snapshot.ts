import type { DashboardSnapshot } from "@/types/domain";

const KEY = "ripple:snapshot";

function kvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function kvGetSnapshot(): Promise<DashboardSnapshot | null> {
  if (!kvConfigured()) return null;
  const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(KEY)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: string | null };
  if (!json.result) return null;
  try {
    return JSON.parse(json.result) as DashboardSnapshot;
  } catch {
    return null;
  }
}

export async function kvSetSnapshot(snapshot: DashboardSnapshot, ttlSec = 60): Promise<void> {
  if (!kvConfigured()) return;
  const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(KEY)}`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([JSON.stringify(snapshot), { ex: ttlSec }]),
  });
}

export async function kvDeleteSnapshot(): Promise<void> {
  if (!kvConfigured()) return;
  const url = `${process.env.KV_REST_API_URL}/del/${encodeURIComponent(KEY)}`;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
}

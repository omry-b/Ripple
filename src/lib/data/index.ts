import { isDatabaseConfigured } from "@/lib/db/client";
import { mockDataSource } from "./mock-source";
import { postgresDataSource } from "./postgres-source";
import type { RippleDataSource } from "./types";

let cached: RippleDataSource | null = null;

export async function getDataSource(): Promise<RippleDataSource> {
  if (cached) return cached;

  if (isDatabaseConfigured()) {
    cached = postgresDataSource;
    return cached;
  }

  cached = mockDataSource;
  return cached;
}

export function getDataSourceMode(): "mock" | "postgres" {
  return isDatabaseConfigured() ? "postgres" : "mock";
}

export async function resetDataSourceCache() {
  cached = null;
}

export type { RippleDataSource } from "./types";

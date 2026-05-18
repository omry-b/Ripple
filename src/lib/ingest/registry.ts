import { aisAdapter } from "./adapters/ais";
import { financialAdapter } from "./adapters/financial";
import { gdeltAdapter } from "./adapters/gdelt";
import { portsAdapter } from "./adapters/ports";
import { weatherAdapter } from "./adapters/weather";
import type { IngestAdapter } from "./types";

export const INGEST_ADAPTERS: IngestAdapter[] = [
  aisAdapter,
  gdeltAdapter,
  portsAdapter,
  financialAdapter,
  weatherAdapter,
];

export function getAdapter(name: string): IngestAdapter | undefined {
  return INGEST_ADAPTERS.find((a) => a.name === name);
}

import type { IngestAdapter } from "../types";

/** Placeholder AIS / shipping adapter — wire MarineTraffic, Spire, etc. */
export const aisAdapter: IngestAdapter = {
  name: "ais",
  description: "AIS vessel tracking & maritime lane anomalies",
  async fetch() {
    return {
      adapter: "ais",
      message: "PLACEHOLDER: no live AIS API configured (set AIS_API_KEY)",
      events: [
        {
          id: `ais-${Date.now()}`,
          adapter: "ais",
          occurredAt: new Date().toISOString(),
          signalId: "ais",
          severity: 72,
          summary: "Simulated strait corridor density spike",
        },
      ],
    };
  },
};

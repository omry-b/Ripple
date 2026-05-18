import type { IngestAdapter } from "../types";

export const portsAdapter: IngestAdapter = {
  name: "ports",
  description: "Port congestion & dwell times",
  async fetch() {
    return {
      adapter: "ports",
      message: "PLACEHOLDER: no port data API configured",
      events: [
        {
          id: `ports-${Date.now()}`,
          adapter: "ports",
          occurredAt: new Date().toISOString(),
          signalId: "ports",
          severity: 58,
          summary: "Simulated P90 dwell breach at ASEAN hub",
        },
      ],
    };
  },
};

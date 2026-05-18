import type { IngestAdapter } from "../types";

/** Placeholder GDELT / geopolitical news adapter */
export const gdeltAdapter: IngestAdapter = {
  name: "gdelt",
  description: "Geopolitical event index (GDELT-style)",
  async fetch() {
    return {
      adapter: "gdelt",
      message: "PLACEHOLDER: no GDELT API configured",
      events: [
        {
          id: `gdelt-${Date.now()}`,
          adapter: "gdelt",
          occurredAt: new Date().toISOString(),
          signalId: "geo",
          severity: 65,
          summary: "Simulated escalation mention velocity in Taiwan Strait",
        },
      ],
    };
  },
};

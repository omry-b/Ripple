import type { IngestAdapter } from "../types";

export const weatherAdapter: IngestAdapter = {
  name: "weather",
  description: "Severe weather & climate events (NOAA-style)",
  async fetch() {
    return {
      adapter: "weather",
      message: "PLACEHOLDER: no weather API configured (set NOAA_API_KEY)",
      events: [
        {
          id: `wx-${Date.now()}`,
          adapter: "weather",
          occurredAt: new Date().toISOString(),
          signalId: "weather",
          severity: 42,
          summary: "Simulated typhoon track intersecting fab nodes",
        },
      ],
    };
  },
};

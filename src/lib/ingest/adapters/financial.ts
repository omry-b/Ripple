import type { IngestAdapter } from "../types";

export const financialAdapter: IngestAdapter = {
  name: "financial",
  description: "Financial distress & hiring signals",
  async fetch() {
    return {
      adapter: "financial",
      message: "PLACEHOLDER: no financial data API configured",
      events: [
        {
          id: `fin-${Date.now()}`,
          adapter: "financial",
          occurredAt: new Date().toISOString(),
          signalId: "financial",
          companyId: "tsmc",
          severity: 55,
          summary: "Simulated distress z-score drift",
        },
      ],
    };
  },
};

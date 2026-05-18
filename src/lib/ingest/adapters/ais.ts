import type { IngestAdapter } from "../types";

/** AIS adapter — uses Datalastic when AIS_API_KEY is set. */
export const aisAdapter: IngestAdapter = {
  name: "ais",
  description: "AIS vessel tracking & maritime lane anomalies",
  async fetch() {
    const apiKey = process.env.AIS_API_KEY?.trim();
    if (!apiKey) {
      return stubAis("AIS_API_KEY not set");
    }

    try {
      const res = await fetch(
        `https://api.datalastic.com/api/v0/vessel_inradius?api-key=${apiKey}&lat=25.0&lon=121.5&radius=50`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error(`AIS HTTP ${res.status}`);
      const json = (await res.json()) as { data?: unknown[] };
      const count = Array.isArray(json.data) ? json.data.length : 0;
      return {
        adapter: "ais",
        message: `AIS in-radius query returned ${count} vessels`,
        events: [
          {
            id: `ais-${Date.now()}`,
            adapter: "ais",
            occurredAt: new Date().toISOString(),
            signalId: "ais",
            severity: Math.min(90, 50 + count),
            summary: `Taiwan Strait corridor: ${count} vessels in 50nm radius`,
          },
        ],
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "AIS failed";
      return stubAis(message);
    }
  },
};

function stubAis(reason: string) {
  return {
    adapter: "ais" as const,
    message: `Fallback stub (${reason})`,
    events: [
      {
        id: `ais-${Date.now()}`,
        adapter: "ais" as const,
        occurredAt: new Date().toISOString(),
        signalId: "ais",
        severity: 72,
        summary: "Simulated strait corridor density spike",
      },
    ],
  };
}

import type { IngestAdapter } from "../types";

/** NOAA Weather.gov active alerts — no API key required. */
export const weatherAdapter: IngestAdapter = {
  name: "weather",
  description: "Severe weather & climate events (NOAA Weather.gov)",
  async fetch() {
    try {
      const res = await fetch("https://api.weather.gov/alerts/active?status=actual", {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/geo+json", "User-Agent": "Ripple/0.1 (supply-chain-risk)" },
      });
      if (!res.ok) throw new Error(`NOAA HTTP ${res.status}`);
      const json = (await res.json()) as {
        features?: Array<{ properties?: { event?: string; headline?: string; severity?: string } }>;
      };
      const features = json.features?.slice(0, 5) ?? [];
      if (features.length === 0) throw new Error("No alerts");

      const events = features.map((f, i) => ({
        id: `wx-${Date.now()}-${i}`,
        adapter: "weather" as const,
        occurredAt: new Date().toISOString(),
        signalId: "weather",
        severity: f.properties?.severity === "Extreme" ? 75 : 48,
        summary: f.properties?.headline ?? f.properties?.event ?? "Weather alert",
      }));

      return {
        adapter: "weather",
        message: `Ingested ${events.length} NOAA active alerts`,
        events,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "NOAA fetch failed";
      return {
        adapter: "weather",
        message: `Fallback stub (${message})`,
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
    }
  },
};

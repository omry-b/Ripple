import type { IngestAdapter } from "../types";
import { lngLatFromGeoJsonGeometry } from "../geo-utils";

/** NOAA Weather.gov active alerts (live global severe weather). */
export const weatherAdapter: IngestAdapter = {
  name: "weather",
  description: "Severe weather and climate events (NOAA Weather.gov)",
  async fetch() {
    try {
      const res = await fetch("https://api.weather.gov/alerts/active?status=actual", {
        signal: AbortSignal.timeout(12000),
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "Ripple/0.1 (supply-chain-risk)",
        },
      });
      if (!res.ok) throw new Error(`NOAA HTTP ${res.status}`);
      const json = (await res.json()) as {
        features?: Array<{
          geometry?: unknown;
          properties?: { event?: string; headline?: string; severity?: string };
        }>;
      };
      const features = json.features ?? [];
      if (features.length === 0) throw new Error("No alerts");

      const events = features.slice(0, 40).map((f, i) => {
        const coords = lngLatFromGeoJsonGeometry(f.geometry);
        const severity =
          f.properties?.severity === "Extreme"
            ? 78
            : f.properties?.severity === "Severe"
              ? 62
              : 48;
        return {
          id: `wx-${Date.now()}-${i}`,
          adapter: "weather" as const,
          occurredAt: new Date().toISOString(),
          signalId: "weather",
          lng: coords?.lng,
          lat: coords?.lat,
          severity,
          summary: f.properties?.headline ?? f.properties?.event ?? "Weather alert",
        };
      });

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
            lng: 120,
            lat: 23,
            severity: 42,
            summary: "Simulated typhoon track intersecting fab nodes",
          },
        ],
      };
    }
  },
};

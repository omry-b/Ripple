import type { IngestAdapter } from "../types";

const COUNTRY_GEO: Record<string, { lng: number; lat: number }> = {
  China: { lng: 116.4, lat: 39.9 },
  "United States": { lng: -98.5, lat: 39.8 },
  Taiwan: { lng: 121.0, lat: 24.0 },
};

/** World Bank trade indicators (public API). */
export const financialAdapter: IngestAdapter = {
  name: "financial",
  description: "Macro trade / financial stress indicators",
  async fetch() {
    try {
      const res = await fetch(
        "https://api.worldbank.org/v2/country/CHN;USA;TWN;DEU;JPN/indicator/NE.TRD.GNFS.ZS?format=json&per_page=8&date=2022:2024",
        { signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) throw new Error(`World Bank HTTP ${res.status}`);
      const json = (await res.json()) as [
        unknown,
        Array<{ country?: { value?: string }; value?: string; date?: string }>,
      ];
      const rows = (json[1] ?? []).filter((r) => r.value && r.value !== "" && r.country?.value);

      const events = rows.slice(0, 8).map((row, i) => {
        const country = row.country?.value ?? "Global";
        const geo = COUNTRY_GEO[country] ?? { lng: 0, lat: 30 };
        const raw = row.value ?? "n/a";
        const value = Number.isFinite(Number(raw)) ? Number(raw).toFixed(1) : raw;
        return {
          id: `fin-${country}-${row.date ?? i}-${Date.now()}`,
          adapter: "financial" as const,
          occurredAt: new Date().toISOString(),
          signalId: "financial",
          lng: geo.lng,
          lat: geo.lat,
          severity: 40 + (i % 4) * 8,
          summary: `${country} trade (% GDP): ${value}`,
        };
      });

      if (events.length === 0) throw new Error("No indicator rows");

      return {
        adapter: "financial",
        message: `World Bank: ${events.length} country trade indicators`,
        events,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Financial fetch failed";
      return {
        adapter: "financial",
        message: `Fallback stub (${message})`,
        events: Object.entries(COUNTRY_GEO).map(([country, geo], i) => ({
          id: `fin-stub-${i}-${Date.now()}`,
          adapter: "financial" as const,
          occurredAt: new Date().toISOString(),
          signalId: "financial",
          lng: geo.lng,
          lat: geo.lat,
          severity: 44 + i * 5,
          summary: `Simulated macro stress: ${country}`,
        })),
      };
    }
  },
};

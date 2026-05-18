import type { IngestAdapter } from "../types";

/** GDELT DOC API — falls back to stub when network or parsing fails. */
export const gdeltAdapter: IngestAdapter = {
  name: "gdelt",
  description: "Geopolitical event index (GDELT DOC 2.0)",
  async fetch() {
    const query = encodeURIComponent("supply chain OR semiconductor OR taiwan strait");
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=5&format=json`;

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`GDELT HTTP ${res.status}`);
      const json = (await res.json()) as {
        articles?: Array<{ title?: string; seendate?: string }>;
      };
      const articles = json.articles ?? [];
      if (articles.length === 0) throw new Error("No articles");

      const events = articles.map((a, i) => ({
        id: `gdelt-${Date.now()}-${i}`,
        adapter: "gdelt" as const,
        occurredAt: a.seendate ?? new Date().toISOString(),
        signalId: "geo",
        severity: 55 + (i % 3) * 10,
        summary: a.title ?? "Geopolitical mention",
      }));

      return {
        adapter: "gdelt",
        message: `Ingested ${events.length} articles from GDELT DOC API`,
        events,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "GDELT fetch failed";
      return {
        adapter: "gdelt",
        message: `Fallback stub (${message})`,
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
    }
  },
};

import { getAlerts, getSignals } from "@/lib/api";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://ripple-ruby.vercel.app";
  const [alerts, signals] = await Promise.all([getAlerts(), getSignals()]);

  const items = [
    ...alerts
      .filter((a) => a.status === "open")
      .slice(0, 10)
      .map(
        (a) => `
    <item>
      <title>${escapeXml(a.title)} [${a.level}]</title>
      <link>${base}/companies?alert=${a.id}</link>
      <description>${escapeXml(a.detail)}</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`
      ),
    ...signals
      .filter((s) => s.level !== "normal")
      .slice(0, 10)
      .map(
        (s) => `
    <item>
      <title>${escapeXml(s.name)} score ${s.score}</title>
      <link>${base}/signals</link>
      <description>${escapeXml(s.description)}</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`
      ),
  ].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ripple Risk Feed</title>
    <link>${base}</link>
    <description>Open alerts and elevated signal streams</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

import { getSearchIndex } from "@/lib/api";
import { NAV_ITEMS } from "@/lib/nav";

export async function GET() {
  const index = await getSearchIndex();
  const navigation = NAV_ITEMS.map((item) => ({
    id: item.href,
    label: item.label,
    sublabel: "Navigate",
    href: item.href,
    group: "Navigate" as const,
  }));

  return Response.json({
    asOf: new Date().toISOString(),
    items: [...navigation, ...index.companies, ...index.alerts, ...index.signals],
  });
}

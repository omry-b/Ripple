import { getCompanies, getSignals, getSnapshot } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { CompactMetricsStrip } from "@/components/shell/CompactMetricsStrip";
import { SignalsPageClient } from "@/components/signals/SignalsPageClient";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { formatAsOf } from "@/lib/format";

export const metadata = {
  title: "Signals — Ripple",
};

export default async function SignalsPage() {
  const [streams, snapshot, companies] = await Promise.all([
    getSignals(),
    getSnapshot(),
    getCompanies(),
  ]);

  return (
    <>
      <PageHeader
        title="Live Signal Streams"
        subtitle={`${streams.length} active channels · updated ${formatAsOf(snapshot.asOf)}`}
      />
      <CompactMetricsStrip />
      <main className="content-container">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Signals" },
          ]}
        />
        <span className="section-label">All streams · click for detail</span>
        <SignalsPageClient streams={streams} companies={companies} />
      </main>
    </>
  );
}

import { getAlert, getCompanies, getSnapshot } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { CompactMetricsStrip } from "@/components/shell/CompactMetricsStrip";
import { CompaniesPageClient } from "@/components/companies/CompaniesPageClient";
import { formatAsOf } from "@/lib/format";

export const metadata = {
  title: "Companies — Ripple",
};

type Props = {
  searchParams: Promise<{ alert?: string; watchlist?: string }>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const { alert: alertId, watchlist } = await searchParams;
  const watchlistOnly = watchlist === "1";
  const [companies, snapshot, alertFilter] = await Promise.all([
    getCompanies(),
    getSnapshot(),
    alertId ? getAlert(alertId) : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader
        title="Company Exposure"
        subtitle={`${snapshot.trackedCompanies} tracked · ${snapshot.exposedCompanies} currently exposed · ${formatAsOf(snapshot.asOf)}`}
      />
      <CompactMetricsStrip />
      <main className="content-container">
        <span className="section-label">Full ranking</span>
        <CompaniesPageClient
          companies={companies}
          alertFilter={alertFilter}
          watchlistOnly={watchlistOnly}
        />
      </main>
    </>
  );
}

import { Suspense } from "react";
import { getAlert, getCompanies, getSnapshot } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { CompaniesPageClient } from "@/components/companies/CompaniesPageClient";
import { CompaniesTableSkeleton } from "@/components/companies/CompaniesTableSkeleton";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { WatchlistManager } from "@/components/watchlists/WatchlistManager";
import { formatAsOf } from "@/lib/format";

export const metadata = {
  title: "Ripple | Companies",
};

type Props = {
  searchParams: Promise<{ alert?: string; watchlist?: string; region?: string }>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const { alert: alertId, watchlist, region } = await searchParams;
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
      <main className="content-container">
        <Breadcrumbs items={[{ label: "Companies" }]} />
        <span className="section-label">Full ranking</span>
        <Suspense fallback={<CompaniesTableSkeleton />}>
          <CompaniesPageClient
            companies={companies}
            alertFilter={alertFilter}
            watchlistOnly={watchlistOnly}
            regionFilter={region ?? null}
          />
        </Suspense>
        <span className="section-label">Watchlists</span>
        <div className="watchlist-panels">
          <WatchlistManager />
        </div>
      </main>
    </>
  );
}

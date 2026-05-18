import { getAlert, getCompanies, getSnapshot } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { CompaniesPageClient } from "@/components/companies/CompaniesPageClient";
import { formatAsOf } from "@/lib/format";

export const metadata = {
  title: "Companies — Ripple",
};

type Props = {
  searchParams: Promise<{ alert?: string }>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const { alert: alertId } = await searchParams;
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
        <span className="section-label">Full ranking</span>
        <CompaniesPageClient companies={companies} alertFilter={alertFilter} />
      </main>
    </>
  );
}

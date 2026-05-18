import { getCompanies, getSnapshot } from "@/lib/api";
import { PageHeader } from "@/components/shell/PageHeader";
import { CompanyExposureTable } from "@/components/tables/CompanyExposureTable";

export const metadata = {
  title: "Companies — Ripple",
};

export default async function CompaniesPage() {
  const [companies, snapshot] = await Promise.all([getCompanies(), getSnapshot()]);

  return (
    <>
      <PageHeader
        title="Company Exposure"
        subtitle={`${snapshot.trackedCompanies} tracked · ${snapshot.exposedCompanies} currently exposed`}
      />
      <main className="content-container">
        <span className="section-label">Full ranking</span>
        <CompanyExposureTable companies={companies} />
      </main>
    </>
  );
}

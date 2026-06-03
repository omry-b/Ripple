import { CompaniesTableSkeleton } from "@/components/companies/CompaniesTableSkeleton";
import { PageHeader } from "@/components/shell/PageHeader";

export default function CompaniesLoading() {
  return (
    <>
      <PageHeader title="Company Exposure" subtitle="Loading portfolio…" />
      <main className="content-container">
        <CompaniesTableSkeleton />
      </main>
    </>
  );
}

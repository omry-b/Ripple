import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CompanyNotFound() {
  return (
    <>
      <PageHeader title="Company not found" subtitle="No profile in tracked universe" />
      <main className="content-container">
        <EmptyState
          title="Company not found"
          description="This ID is not in your org's tracked universe. Search the full roster or return to the ranking."
          action={
            <Link href="/companies" className="filter-export-btn">
              Browse companies
            </Link>
          }
        />
      </main>
    </>
  );
}

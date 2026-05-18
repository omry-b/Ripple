import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function CompanyNotFound() {
  return (
    <>
      <PageHeader title="Company not found" subtitle="No profile in tracked universe" />
      <main className="content-container">
        <Link
          href="/companies"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            color: "#3B82F6",
            textDecoration: "none",
          }}
        >
          ← Back to companies
        </Link>
      </main>
    </>
  );
}

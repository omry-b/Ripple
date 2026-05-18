import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function DashboardNotFound() {
  return (
    <>
      <PageHeader title="Page not found" subtitle="This route is not in the tracked universe" />
      <main className="content-container" id="main-content">
        <p style={{ fontSize: 13, color: "#737373", marginBottom: 24 }}>
          The page you requested does not exist in Ripple.
        </p>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            color: "#3B82F6",
            textDecoration: "none",
          }}
        >
          ← Back to overview
        </Link>
      </main>
    </>
  );
}

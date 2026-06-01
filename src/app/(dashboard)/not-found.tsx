import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function DashboardNotFound() {
  return (
    <>
      <PageHeader title="Page not found" subtitle="This route is not in the tracked universe" />
      <main className="content-container error-page" id="main-content">
        <div className="empty-state-panel">
          <p className="empty-state-title">404  -  off the map</p>
          <p className="empty-state-desc">
            The page you requested does not exist in Ripple. Check the URL or return to the
            overview.
          </p>
          <Link href="/" className="welcome-cta-primary error-page-cta">
            ← Back to overview
          </Link>
        </div>
      </main>
    </>
  );
}

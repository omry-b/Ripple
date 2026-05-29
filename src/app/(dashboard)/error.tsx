"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="content-container error-page" id="main-content">
      <div className="empty-state-panel">
        <p className="empty-state-title">Something went wrong</p>
        <p className="empty-state-desc">
          {error.message || "An unexpected error occurred loading this view."}
        </p>
        <div className="error-page-actions">
          <button type="button" className="reset-workbench-btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="text-link">
            Back to overview
          </Link>
        </div>
      </div>
    </main>
  );
}

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
    <main className="content-container" style={{ paddingTop: 64 }}>
      <h1 className="page-header-title">Something went wrong</h1>
      <p style={{ color: "#737373", fontSize: 13, margin: "12px 0 24px" }}>
        {error.message || "An unexpected error occurred loading this view."}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" className="reset-workbench-btn" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="text-link" style={{ fontSize: 12, alignSelf: "center" }}>
          Back to overview
        </Link>
      </div>
    </main>
  );
}

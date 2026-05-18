"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Ripple encountered an error</h1>
          <p style={{ color: "#737373", fontSize: 14, marginTop: 12 }}>
            {error.message || "A critical error prevented the app from loading."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "8px 16px",
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: 6,
              color: "#f5f5f5",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

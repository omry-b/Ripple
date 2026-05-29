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
      <body className="ripple-app">
        <main className="error-page global-error-shell">
          <p className="welcome-eyebrow global-error-eyebrow">Critical error</p>
          <h1 className="welcome-headline global-error-title">Ripple encountered an error</h1>
          <p className="prose-muted">
            {error.message || "A critical error prevented the app from loading."}
          </p>
          <button type="button" className="error-retry-btn global-error-retry" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

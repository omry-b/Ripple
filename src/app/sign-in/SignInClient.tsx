"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export function SignInClient() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (hasClerk) {
    return (
      <main className="auth-placeholder-page">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" />
      </main>
    );
  }

  return (
    <main className="auth-placeholder-page">
      <div className="auth-placeholder-card">
        <h1>Ripple</h1>
        <p className="auth-placeholder-lead">
          Demo mode — use the dashboard directly or set role/org in the user menu. Add{" "}
          <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> for production auth.
        </p>
        <Link href="/" className="filter-export-btn">
          Continue to dashboard →
        </Link>
      </div>
    </main>
  );
}

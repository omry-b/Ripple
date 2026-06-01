"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { MarketingShell } from "@/components/shell/MarketingShell";

export function SignInClient() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <MarketingShell>
      <main className="auth-page">
        {hasClerk ? (
          <div className="auth-clerk-wrap">
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" />
          </div>
        ) : (
          <div className="auth-card">
            <p className="welcome-eyebrow">Sign in</p>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-lead">
              Demo mode  -  use the dashboard directly or set role and org in the user menu. Add{" "}
              <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> for production auth.
            </p>
            <Link href="/" className="welcome-cta-primary auth-cta">
              Continue to dashboard →
            </Link>
            <Link href="/sign-up" className="auth-alt-link">
              Create an account
            </Link>
          </div>
        )}
      </main>
    </MarketingShell>
  );
}

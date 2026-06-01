"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { MarketingShell } from "@/components/shell/MarketingShell";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

const ClerkSignUp = dynamic(
  () => import("@/components/auth/ClerkSignUp").then((m) => m.ClerkSignUp),
  { ssr: false }
);

export function SignUpClient() {
  const hasClerk = isClerkConfigured();

  return (
    <MarketingShell>
      <main className="auth-page">
        {hasClerk ? (
          <ClerkSignUp />
        ) : (
          <div className="auth-card">
            <p className="welcome-eyebrow">Get started</p>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-lead">
              Add Clerk keys on Vercel to enable Google sign-up and saved watchlists.
            </p>
            <Link href="/" className="welcome-cta-primary auth-cta">
              Continue in demo mode →
            </Link>
            <Link href="/sign-in" className="auth-alt-link">
              Already have an account? Sign in
            </Link>
          </div>
        )}
      </main>
    </MarketingShell>
  );
}

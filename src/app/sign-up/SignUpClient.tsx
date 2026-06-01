"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { MarketingShell } from "@/components/shell/MarketingShell";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

const FirebaseGoogleSignIn = dynamic(
  () => import("@/components/auth/FirebaseGoogleSignIn").then((m) => m.FirebaseGoogleSignIn),
  { ssr: false }
);

export function SignUpClient() {
  const hasFirebase = isFirebaseClientConfigured();

  return (
    <MarketingShell>
      <main className="auth-page">
        {hasFirebase ? (
          <FirebaseGoogleSignIn />
        ) : (
          <div className="auth-card">
            <p className="welcome-eyebrow">Get started</p>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-lead">
              Add Firebase env vars on Vercel to enable Google sign-up and saved watchlists.
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

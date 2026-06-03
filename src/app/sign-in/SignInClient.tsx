"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { MarketingShell } from "@/components/shell/MarketingShell";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

const FirebaseGoogleSignIn = dynamic(
  () => import("@/components/auth/FirebaseGoogleSignIn").then((m) => m.FirebaseGoogleSignIn),
  { ssr: false }
);

export function SignInClient() {
  const hasFirebase = isFirebaseClientConfigured();

  return (
    <MarketingShell>
      <main className="auth-page auth-page--polish">
        {hasFirebase ? (
          <FirebaseGoogleSignIn />
        ) : (
          <div className="auth-card">
            <p className="welcome-eyebrow">Sign in</p>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-lead">
              Demo mode: use the dashboard directly, or add Firebase env vars for Google
              sign-in and saved watchlists.
            </p>
            <Link href="/" className="welcome-cta-primary auth-cta">
              Continue to dashboard →
            </Link>
          </div>
        )}
      </main>
    </MarketingShell>
  );
}

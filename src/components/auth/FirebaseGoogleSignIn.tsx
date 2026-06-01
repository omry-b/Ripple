"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";

export function FirebaseGoogleSignIn() {
  const router = useRouter();
  const { user, signInWithGoogle, loading, signingIn, authError, isConfigured, clearAuthError } =
    useFirebaseAuth();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  if (!isConfigured) {
    return (
      <p className="auth-lead">
        Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* and admin service account env
        vars on Vercel.
      </p>
    );
  }

  const busy = loading || signingIn;

  return (
    <div className="auth-firebase-wrap">
      <p className="welcome-eyebrow">Sign in</p>
      <h1 className="auth-title">Continue with Google</h1>
      <p className="auth-lead">
        Save your watchlist and sync starred companies across devices using Firebase
        Authentication.
      </p>
      {authError ? (
        <p className="auth-error" role="alert">
          {authError}{" "}
          <button type="button" className="auth-error-dismiss" onClick={clearAuthError}>
            Dismiss
          </button>
        </p>
      ) : null}
      <button
        type="button"
        className="welcome-cta-primary auth-cta"
        disabled={busy}
        onClick={() => void signInWithGoogle()}
      >
        {busy ? "Signing in…" : "Sign in with Google"}
      </button>
    </div>
  );
}

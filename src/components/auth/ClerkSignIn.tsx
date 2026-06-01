"use client";

import { SignIn } from "@clerk/nextjs";

export function ClerkSignIn() {
  return (
    <div className="auth-clerk-wrap">
      <p className="welcome-eyebrow">Sign in</p>
      <h1 className="auth-title">Continue with Google</h1>
      <p className="auth-lead">
        Save your watchlist and sync starred companies across devices. Enable Google as the
        only sign-in provider in your Clerk dashboard.
      </p>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/"
        appearance={{
          elements: {
            rootBox: "auth-clerk-root",
            card: "auth-clerk-card",
          },
        }}
      />
    </div>
  );
}

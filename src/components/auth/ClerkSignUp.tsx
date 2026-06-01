"use client";

import { SignUp } from "@clerk/nextjs";

export function ClerkSignUp() {
  return (
    <div className="auth-clerk-wrap">
      <p className="welcome-eyebrow">Get started</p>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-lead">
        Use Google to save watchlists and return to your portfolio view anytime.
      </p>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
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

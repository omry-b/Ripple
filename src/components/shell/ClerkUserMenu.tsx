"use client";

import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";

export function ClerkUserMenu() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "Account";

  if (!isSignedIn) {
    return (
      <div className="user-menu clerk-user-menu">
        <SignInButton mode="modal">
          <button type="button" className="filter-export-btn">
            Sign in with Google
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="user-menu clerk-user-menu">
      <span className="user-menu-email clerk-user-email">{email}</span>
      <UserButton />
    </div>
  );
}

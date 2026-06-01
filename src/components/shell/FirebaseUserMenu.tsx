"use client";

import { useFirebaseAuth } from "@/context/FirebaseAuthContext";

export function FirebaseUserMenu() {
  const { user, loading, isConfigured, signInWithGoogle, signOutUser } = useFirebaseAuth();

  if (!isConfigured) return null;

  if (loading) {
    return <span className="user-menu-label">…</span>;
  }

  if (!user) {
    return (
      <button type="button" className="filter-export-btn" onClick={() => void signInWithGoogle()}>
        Sign in with Google
      </button>
    );
  }

  const email = user.email ?? "Signed in";
  const initial = (user.displayName ?? email).charAt(0).toUpperCase();

  return (
    <div className="user-menu firebase-user-menu">
      <button type="button" className="user-menu-trigger" aria-haspopup="menu">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="user-avatar-img" width={28} height={28} />
        ) : (
          <span className="user-avatar" aria-hidden>
            {initial}
          </span>
        )}
        <span className="user-menu-label">{user.displayName ?? "Account"}</span>
      </button>
      <div className="user-menu-panel" role="menu">
        <p className="user-menu-email">{email}</p>
        <p className="user-menu-hint">Watchlist synced to your Google account.</p>
        <button type="button" className="user-menu-link" onClick={() => void signOutUser()}>
          Sign out
        </button>
      </div>
    </div>
  );
}

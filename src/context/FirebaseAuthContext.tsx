"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";

type FirebaseAuthContextValue = {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

function formatAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: string }).code)
      : "";
  const message =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: string }).message)
      : "Sign-in failed. Try again.";

  if (code === "auth/unauthorized-domain") {
    return "This site URL is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
  }
  if (code === "auth/popup-blocked") {
    return "Popup blocked. Allow popups for this site or try again (we will use redirect).";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Sign-in cancelled.";
  }
  return message;
}

async function syncSessionCookie(user: User | null): Promise<void> {
  const opts = { credentials: "include" as const };
  if (!user) {
    await fetch("/api/auth/session", { method: "DELETE", ...opts });
    return;
  }
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    ...opts,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Session sync failed (${res.status})`);
  }
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isFirebaseClientConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();

    void getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        await syncSessionCookie(result.user);
      })
      .catch((err) => setAuthError(formatAuthError(err)));

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      setSigningIn(false);
      void syncSessionCookie(nextUser).catch((err) =>
        setAuthError(err instanceof Error ? err.message : "Could not sync session.")
      );
    });
    return () => unsub();
  }, [isConfigured]);

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured || signingIn) return;
    setAuthError(null);
    setSigningIn(true);

    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: string }).code)
          : "";

      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          setAuthError(formatAuthError(redirectErr));
          setSigningIn(false);
          return;
        }
      }

      setAuthError(formatAuthError(err));
      setSigningIn(false);
    }
  }, [isConfigured, signingIn]);

  const signOutUser = useCallback(async () => {
    if (!isConfigured) return;
    setAuthError(null);
    await signOut(getFirebaseAuth());
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
  }, [isConfigured]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signingIn,
      authError,
      isConfigured,
      signInWithGoogle,
      signOutUser,
      clearAuthError,
    }),
    [user, loading, signingIn, authError, isConfigured, signInWithGoogle, signOutUser, clearAuthError]
  );

  return (
    <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) {
    throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider");
  }
  return ctx;
}

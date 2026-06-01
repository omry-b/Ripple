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
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";

type FirebaseAuthContextValue = {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

async function syncSessionCookie(user: User | null): Promise<void> {
  const opts = { credentials: "include" as const };
  if (!user) {
    await fetch("/api/auth/session", { method: "DELETE", ...opts });
    return;
  }
  const idToken = await user.getIdToken(true);
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    ...opts,
  });
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = isFirebaseClientConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      void syncSessionCookie(nextUser).catch(() => {});
    });
    return () => unsub();
  }, [isConfigured]);

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) return;
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  }, [isConfigured]);

  const signOutUser = useCallback(async () => {
    if (!isConfigured) return;
    await signOut(getFirebaseAuth());
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
  }, [isConfigured]);

  const value = useMemo(
    () => ({ user, loading, isConfigured, signInWithGoogle, signOutUser }),
    [user, loading, isConfigured, signInWithGoogle, signOutUser]
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

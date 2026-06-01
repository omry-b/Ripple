import { cookies } from "next/headers";
import { authConfig, isAuthEnabled } from "./config";
import { ensureUserRecord } from "./ensure-user";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export type SessionUser = {
  id: string;
  email: string;
  organizationId: string;
  role: "viewer" | "analyst" | "admin";
};

export const FIREBASE_SESSION_COOKIE = "__firebase_session";

async function sessionFromFirebaseToken(token: string): Promise<SessionUser | null> {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth
      .verifySessionCookie(token, true)
      .catch(() => adminAuth.verifyIdToken(token, true));

    const sessionUser: SessionUser = {
      id: decoded.uid,
      email: decoded.email ?? authConfig.demoEmail,
      organizationId: `personal_${decoded.uid}`,
      role: authConfig.demoRole,
    };
    await ensureUserRecord(sessionUser);
    return sessionUser;
  } catch {
    return null;
  }
}

/**
 * Resolves the current user from Firebase session cookie, Bearer token, or demo headers.
 */
export async function getSessionUser(request?: Request): Promise<SessionUser> {
  if (isAuthEnabled()) {
    let token =
      request?.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? undefined;

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;
    }

    if (token) {
      const firebaseUser = await sessionFromFirebaseToken(token);
      if (firebaseUser) return firebaseUser;
    }
  }

  const headers = request?.headers;
  const roleHeader = headers?.get("x-ripple-role");
  const role =
    roleHeader === "viewer" || roleHeader === "analyst" || roleHeader === "admin"
      ? roleHeader
      : authConfig.demoRole;

  return {
    id: headers?.get("x-ripple-user-id") ?? authConfig.demoUserId,
    email: headers?.get("x-ripple-user-email") ?? authConfig.demoEmail,
    organizationId: headers?.get("x-ripple-org-id") ?? authConfig.demoOrgId,
    role,
  };
}

import { cookies } from "next/headers";
import { authConfig, isAuthEnabled } from "./config";
import { ensureUserRecord } from "./ensure-user";
import { FIREBASE_SESSION_COOKIE } from "./constants";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export type SessionUser = {
  id: string;
  email: string;
  organizationId: string;
  role: "viewer" | "analyst" | "admin";
};

export { FIREBASE_SESSION_COOKIE } from "./constants";

const ANONYMOUS_USER: SessionUser = {
  id: "anonymous",
  email: "",
  organizationId: authConfig.demoOrgId,
  role: "viewer",
};

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
      organizationId: authConfig.demoOrgId,
      role: authConfig.demoRole,
    };
    await ensureUserRecord(sessionUser);
    return sessionUser;
  } catch {
    return null;
  }
}

function demoUserFromHeaders(request?: Request): SessionUser {
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
      if (process.env.NODE_ENV === "production") {
        return ANONYMOUS_USER;
      }
    }

    const demoHeaders = request?.headers.get("x-ripple-user-id");
    if (demoHeaders || process.env.NODE_ENV !== "production") {
      return demoUserFromHeaders(request);
    }

    return ANONYMOUS_USER;
  }

  return demoUserFromHeaders(request);
}

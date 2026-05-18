import { authConfig, isAuthEnabled } from "./config";

export type SessionUser = {
  id: string;
  email: string;
  organizationId: string;
  role: "viewer" | "analyst" | "admin";
};

/**
 * Resolves the current user from Clerk (future) or demo headers.
 * Pass `x-ripple-user-id` / `x-ripple-org-id` for integration tests.
 */
export async function getSessionUser(request?: Request): Promise<SessionUser> {
  if (isAuthEnabled()) {
    // PLACEHOLDER: integrate @clerk/nextjs auth() when keys are set
    // const { userId, orgId } = await auth();
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

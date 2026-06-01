/**
 * Auth: Firebase Google sign-in when configured, else demo headers.
 */
export const authConfig = {
  provider: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "firebase" : "demo",
  demoUserId: process.env.DEMO_USER_ID ?? "user_demo",
  demoOrgId: process.env.DEMO_ORG_ID ?? "org_demo",
  demoEmail: process.env.DEMO_USER_EMAIL ?? "analyst@ripple.demo",
  demoRole: (process.env.DEMO_USER_ROLE ?? "analyst") as "viewer" | "analyst" | "admin",
};

export function isAuthEnabled(): boolean {
  const hasClient = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  );
  const hasAdmin =
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) ||
    Boolean(
      process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()
    );
  return hasClient && hasAdmin;
}

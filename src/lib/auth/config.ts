/**
 * Auth configuration — Clerk placeholders.
 * Set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable real auth.
 */
export const authConfig = {
  provider: process.env.CLERK_SECRET_KEY ? "clerk" : "demo",
  demoUserId: process.env.DEMO_USER_ID ?? "user_demo",
  demoOrgId: process.env.DEMO_ORG_ID ?? "org_demo",
  demoEmail: process.env.DEMO_USER_EMAIL ?? "analyst@ripple.demo",
  demoRole: (process.env.DEMO_USER_ROLE ?? "analyst") as "viewer" | "analyst" | "admin",
};

export function isAuthEnabled(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY?.trim());
}

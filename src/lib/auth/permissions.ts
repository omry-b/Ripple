import type { SessionUser } from "@/lib/auth/session";

export type UserRole = SessionUser["role"];

export const ROLE_PERMISSIONS = {
  viewer: {
    acknowledgeAlerts: false,
    runScenarios: false,
    manageWatchlists: false,
    manageWebhooks: false,
    manageIngest: false,
  },
  analyst: {
    acknowledgeAlerts: true,
    runScenarios: true,
    manageWatchlists: true,
    manageWebhooks: false,
    manageIngest: false,
  },
  admin: {
    acknowledgeAlerts: true,
    runScenarios: true,
    manageWatchlists: true,
    manageWebhooks: true,
    manageIngest: true,
  },
} as const;

export function getPermissions(role: UserRole) {
  return ROLE_PERMISSIONS[role];
}

export function canPerform(
  role: UserRole,
  action: keyof (typeof ROLE_PERMISSIONS)["viewer"]
): boolean {
  return ROLE_PERMISSIONS[role][action];
}

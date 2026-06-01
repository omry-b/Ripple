"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import type { UserRole } from "@/lib/auth/permissions";

const ClerkUserMenu = dynamic(
  () => import("./ClerkUserMenu").then((m) => m.ClerkUserMenu),
  { ssr: false, loading: () => null }
);

const ROLES: UserRole[] = ["viewer", "analyst", "admin"];

function DemoUserMenu() {
  const { role, email, permissions, setRole } = useDemoAuth();

  return (
    <div className="user-menu">
      <button type="button" className="user-menu-trigger" aria-haspopup="menu">
        <span className="user-avatar" aria-hidden>
          {email.charAt(0).toUpperCase()}
        </span>
        <span className="user-menu-label">{role}</span>
      </button>
      <div className="user-menu-panel" role="menu">
        <p className="user-menu-email">{email}</p>
        <p className="user-menu-hint">Demo mode. Sign in with Google to save watchlists.</p>
        <label className="user-menu-field">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            aria-label="Switch demo role"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <ul className="user-menu-perms">
          <li>{permissions.runScenarios ? "✓" : "·"} Run scenarios</li>
          <li>{permissions.acknowledgeAlerts ? "✓" : "·"} Acknowledge alerts</li>
          <li>{permissions.manageWebhooks ? "✓" : "·"} Webhooks</li>
        </ul>
        <Link href="/sign-in" className="user-menu-link">
          Sign in with Google →
        </Link>
        <Link href="/settings/system" className="user-menu-link">
          System status →
        </Link>
      </div>
    </div>
  );
}

export function UserMenu() {
  if (isClerkConfigured()) {
    return <ClerkUserMenu />;
  }
  return <DemoUserMenu />;
}

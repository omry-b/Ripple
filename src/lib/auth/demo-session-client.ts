"use client";

import type { UserRole } from "@/lib/auth/permissions";

const ROLE_KEY = "ripple-demo-role";
const ORG_KEY = "ripple-demo-org";

export function getDemoRole(): UserRole {
  if (typeof window === "undefined") return "analyst";
  const v = localStorage.getItem(ROLE_KEY);
  if (v === "viewer" || v === "analyst" || v === "admin") return v;
  return "analyst";
}

export function setDemoRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new CustomEvent("ripple-demo-auth-change"));
}

export function getDemoOrgId(): string {
  if (typeof window === "undefined") return "org_demo";
  return localStorage.getItem(ORG_KEY) ?? "org_demo";
}

export function setDemoOrgId(orgId: string): void {
  localStorage.setItem(ORG_KEY, orgId);
  window.dispatchEvent(new CustomEvent("ripple-demo-auth-change"));
}

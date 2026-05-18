"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPermissions, type UserRole } from "@/lib/auth/permissions";
import {
  getDemoOrgId,
  getDemoRole,
  setDemoOrgId,
  setDemoRole,
} from "@/lib/auth/demo-session-client";

type DemoAuthContextValue = {
  role: UserRole;
  organizationId: string;
  email: string;
  permissions: ReturnType<typeof getPermissions>;
  setRole: (role: UserRole) => void;
  setOrganizationId: (orgId: string) => void;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("analyst");
  const [organizationId, setOrgState] = useState("org_demo");

  const sync = useCallback(() => {
    setRoleState(getDemoRole());
    setOrgState(getDemoOrgId());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("ripple-demo-auth-change", sync);
    return () => window.removeEventListener("ripple-demo-auth-change", sync);
  }, [sync]);

  const setRole = useCallback((r: UserRole) => {
    setDemoRole(r);
    setRoleState(r);
  }, []);

  const setOrganizationId = useCallback((orgId: string) => {
    setDemoOrgId(orgId);
    setOrgState(orgId);
  }, []);

  const value = useMemo(
    () => ({
      role,
      organizationId,
      email: "analyst@ripple.demo",
      permissions: getPermissions(role),
      setRole,
      setOrganizationId,
    }),
    [role, organizationId, setRole, setOrganizationId]
  );

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }
  return ctx;
}

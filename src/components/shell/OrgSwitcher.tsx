"use client";

import { useDemoAuth } from "@/context/DemoAuthContext";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

const ORGS = [
  { id: "org_demo", label: "Ripple Demo Org" },
  { id: "org_acme", label: "Acme Supply Co" },
  { id: "org_globex", label: "Globex Industries" },
];

export function OrgSwitcher() {
  // Hooks must run unconditionally — call before any early return.
  const { organizationId, setOrganizationId } = useDemoAuth();
  if (isFirebaseClientConfigured()) return null;

  return (
    <label className="org-switcher">
      <span className="org-switcher-label">Org</span>
      <select
        value={organizationId}
        onChange={(e) => setOrganizationId(e.target.value)}
        aria-label="Switch organization"
      >
        {ORGS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

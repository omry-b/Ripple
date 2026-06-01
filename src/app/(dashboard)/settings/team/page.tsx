import { PageHeader } from "@/components/shell/PageHeader";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import Link from "next/link";

const DEMO_MEMBERS = [
  { email: "analyst@ripple.demo", role: "analyst", status: "Active" },
  { email: "viewer@ripple.demo", role: "viewer", status: "Active" },
  { email: "admin@ripple.demo", role: "admin", status: "Active" },
];

export const metadata = { title: "Ripple | Team" };

export default function TeamSettingsPage() {
  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Invite colleagues and manage roles (team invites via Firebase Auth in production)."
      />
      <main className="content-container">
        <Breadcrumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Team" },
          ]}
        />
        <section className="workbench-card team-settings-card">
          <h3 className="supplier-tier-title">Members</h3>
          <ul className="team-member-list">
            {DEMO_MEMBERS.map((m) => (
              <li key={m.email} className="team-member-row">
                <span>{m.email}</span>
                <span className="team-member-role">{m.role}</span>
                <span className="team-member-status">{m.status}</span>
              </li>
            ))}
          </ul>
          <form className="team-invite-form" action="#">
            <label htmlFor="invite-email">Invite by email</label>
            <div className="team-invite-row">
              <input id="invite-email" type="email" placeholder="colleague@company.com" />
              <select aria-label="Role for invite">
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="welcome-cta-primary team-invite-submit">
                Send invite
              </button>
            </div>
            <p className="watchlist-manager-hint">
              Invites are a UI placeholder until team management is wired to Firebase.
            </p>
          </form>
          <p className="watchlist-manager-hint">
            <Link href="/sign-in" className="text-link">
              Sign in
            </Link>{" "}
            with demo roles via the user menu.
          </p>
        </section>
      </main>
    </>
  );
}

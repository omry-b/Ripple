import Link from "next/link";

export const metadata = { title: "Sign up — Ripple" };

export default function SignUpPage() {
  return (
    <main className="auth-placeholder-page">
      <div className="auth-placeholder-card">
        <h1>Create account</h1>
        <p className="auth-placeholder-lead">
          Clerk sign-up will replace this page when <code>CLERK_SECRET_KEY</code> is configured.
        </p>
        <Link href="/sign-in" className="filter-export-btn">
          Sign in instead
        </Link>
        <Link href="/" className="user-menu-link" style={{ display: "block", marginTop: 12 }}>
          Continue in demo mode →
        </Link>
      </div>
    </main>
  );
}

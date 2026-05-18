import Link from "next/link";

export const metadata = {
  title: "Sign in — Ripple",
};

export default function SignInPage() {
  return (
    <main className="auth-placeholder-page">
      <div className="auth-placeholder-card">
        <h1>Ripple</h1>
        <p className="auth-placeholder-lead">
          Authentication is not enabled in demo mode. When{" "}
          <code>CLERK_SECRET_KEY</code> is set, this route will host Clerk sign-in.
        </p>
        <Link href="/" className="filter-export-btn">
          Continue to dashboard →
        </Link>
      </div>
    </main>
  );
}

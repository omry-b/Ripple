import Link from "next/link";
import { MarketingShell } from "@/components/shell/MarketingShell";

export const metadata = { title: "Sign up  -  Ripple" };

export default function SignUpPage() {
  return (
    <MarketingShell>
      <main className="auth-page">
        <div className="auth-card">
          <p className="welcome-eyebrow">Get started</p>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-lead">
            Clerk sign-up replaces this page when <code>CLERK_SECRET_KEY</code> is configured on
            Vercel.
          </p>
          <Link href="/" className="welcome-cta-primary auth-cta">
            Continue in demo mode →
          </Link>
          <Link href="/sign-in" className="auth-alt-link">
            Already have an account? Sign in
          </Link>
        </div>
      </main>
    </MarketingShell>
  );
}

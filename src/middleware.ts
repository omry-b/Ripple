import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware placeholder — extend with Clerk when CLERK_SECRET_KEY is set.
 * Public: dashboard UI, read APIs, health.
 */
const PUBLIC_API_PREFIXES = [
  "/api/health",
  "/api/dashboard",
  "/api/snapshot",
  "/api/signals",
  "/api/companies",
  "/api/alerts",
  "/api/scenarios",
  "/api/search",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }

  if (process.env.CLERK_SECRET_KEY) {
    // PLACEHOLDER: return auth().protect() for protected routes
  }

  if (pathname.startsWith("/api/") && !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const hasSession =
      request.headers.get("x-ripple-user-id") ||
      !process.env.REQUIRE_AUTH_FOR_MUTATIONS;
    if (process.env.REQUIRE_AUTH_FOR_MUTATIONS === "true" && !hasSession) {
      return Response.json({ error: "Auth required (demo: send x-ripple-user-id)" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

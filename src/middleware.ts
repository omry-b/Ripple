import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";

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

  if (
    process.env.REQUIRE_AUTH_FOR_UI === "true" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/welcome")
  ) {
    const hasSession =
      request.cookies.get("__session")?.value ||
      request.headers.get("x-ripple-user-id");
    if (!hasSession && !process.env.CLERK_SECRET_KEY) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const limited = checkRateLimit(`api:${ip}`);
    if (!limited.ok) {
      return Response.json(
        {
          asOf: new Date().toISOString(),
          error: "Too many requests",
          retryAfterSec: limited.retryAfterSec,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }
  }

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
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};

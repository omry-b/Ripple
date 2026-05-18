import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/api/rate-limit";

const PUBLIC_API_PREFIXES = [
  "/api/health",
  "/api/dashboard",
  "/api/snapshot",
  "/api/signals",
  "/api/companies",
  "/api/alerts",
  "/api/scenarios",
  "/api/search",
  "/api/openapi",
];

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/welcome(.*)",
  "/embed(.*)",
  "/pricing(.*)",
  "/changelog(.*)",
  "/api-docs(.*)",
  "/api/health(.*)",
  "/api/cron/(.*)",
]);

function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/")) return null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const limited = checkRateLimit(`api:${ip}`);
  if (!limited.ok) {
    return NextResponse.json(
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
  return null;
}

function applyMutationAuth(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/cron/")) return null;

  if (
    pathname.startsWith("/api/") &&
    !PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const hasSession =
      request.headers.get("x-ripple-user-id") ||
      request.cookies.get("__session")?.value ||
      !process.env.REQUIRE_AUTH_FOR_MUTATIONS;
    if (process.env.REQUIRE_AUTH_FOR_MUTATIONS === "true" && !hasSession) {
      return NextResponse.json(
        { error: "Auth required (demo: send x-ripple-user-id)" },
        { status: 401 }
      );
    }
  }
  return null;
}

const useClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());

const clerkHandler = clerkMiddleware(async (auth, request) => {
  const blocked = applyRateLimit(request) ?? applyMutationAuth(request);
  if (blocked) return blocked;

  const { pathname } = request.nextUrl;
  if (
    process.env.REQUIRE_AUTH_FOR_UI === "true" &&
    !pathname.startsWith("/api") &&
    !isPublicRoute(request)
  ) {
    await auth.protect();
  }
});

function demoMiddleware(request: NextRequest) {
  const blocked = applyRateLimit(request) ?? applyMutationAuth(request);
  if (blocked) return blocked;

  const { pathname } = request.nextUrl;
  if (
    process.env.REQUIRE_AUTH_FOR_UI === "true" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/welcome") &&
    !pathname.startsWith("/embed")
  ) {
    const hasSession =
      request.cookies.get("__session")?.value || request.headers.get("x-ripple-user-id");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export default useClerk ? clerkHandler : demoMiddleware;

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};

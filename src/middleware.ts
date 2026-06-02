import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { FIREBASE_SESSION_COOKIE } from "@/lib/auth/constants";

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
  "/api/auth/session",
  "/api/ops/status",
];

function mutationAuthRequired(): boolean {
  if (process.env.REQUIRE_AUTH_FOR_MUTATIONS === "true") return true;
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim());
}

function hasClientSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(FIREBASE_SESSION_COOKIE)?.value ||
      request.headers.get("x-ripple-user-id")
  );
}

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
    const hasSession = hasClientSession(request);
    if (mutationAuthRequired() && !hasSession) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }
  }
  return null;
}

export default function rippleMiddleware(request: NextRequest) {
  const blocked = applyRateLimit(request) ?? applyMutationAuth(request);
  if (blocked) return blocked;

  const { pathname } = request.nextUrl;
  if (
    process.env.REQUIRE_AUTH_FOR_UI === "true" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/welcome") &&
    !pathname.startsWith("/embed") &&
    !pathname.startsWith("/pricing") &&
    !pathname.startsWith("/changelog") &&
    !pathname.startsWith("/api-docs")
  ) {
    const hasSession = hasClientSession(request);
    if (!hasSession) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};

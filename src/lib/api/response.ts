import { isDatabaseConfigured } from "@/lib/db/client";

export const CACHE_PUBLIC_SHORT = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
} as const;

export const CACHE_DYNAMIC = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate",
} as const;

/** Postgres production: no CDN caching. Mock/demo: short public cache. */
export function dataApiCacheHeaders(): HeadersInit {
  return isDatabaseConfigured() ? CACHE_DYNAMIC : CACHE_PUBLIC_SHORT;
}

export function jsonOk<T extends Record<string, unknown>>(
  body: T,
  status = 200,
  headers?: HeadersInit
) {
  return Response.json({ asOf: new Date().toISOString(), ...body }, { status, headers });
}

/** Standard envelope: `{ asOf, data }` for typed clients. */
export function jsonData<T>(
  data: T,
  status = 200,
  headers?: HeadersInit
): Response {
  return Response.json(
    { asOf: new Date().toISOString(), data },
    { status, headers }
  );
}

export function jsonError(message: string, status: number, headers?: HeadersInit) {
  return Response.json(
    { asOf: new Date().toISOString(), error: message },
    { status, headers }
  );
}

export type { ApiErrorBody } from "@/lib/api/error-body";
export { readApiError } from "@/lib/api/error-body";

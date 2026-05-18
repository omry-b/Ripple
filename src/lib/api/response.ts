export const CACHE_PUBLIC_SHORT = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
} as const;

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

export function jsonError(message: string, status: number) {
  return Response.json(
    { asOf: new Date().toISOString(), error: message },
    { status }
  );
}

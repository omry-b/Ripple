import { jsonError } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rate-limit";

export async function withApiHandler(
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    return jsonError(message, 500);
  }
}

/** Returns a 429 response when over limit, otherwise null. */
export function rateLimitResponse(
  request: Request,
  bucketKey: string,
  limit = 90,
  windowMs = 60_000
): Response | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "local";
  const result = checkRateLimit(`${bucketKey}:${ip}`, limit, windowMs);
  if (result.ok) return null;
  return jsonError("Too many requests — try again shortly", 429);
}

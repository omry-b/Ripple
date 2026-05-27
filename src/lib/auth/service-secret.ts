/** Bearer auth for cron routes, internal ingest, and edge workers. */
export function authorizeServiceRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.INGEST_INTERNAL_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export function serviceAuthHeaders(): HeadersInit {
  const secret = process.env.CRON_SECRET ?? process.env.INGEST_INTERNAL_SECRET;
  return secret ? { Authorization: `Bearer ${secret}` } : {};
}

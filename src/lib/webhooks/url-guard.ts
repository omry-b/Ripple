/**
 * SSRF protection for outbound webhooks.
 *
 * A webhook URL is attacker-controllable (anyone who can create a subscription
 * picks where we POST). Without validation the server could be coerced into
 * requesting internal services or cloud-metadata endpoints (169.254.169.254).
 * We block private / reserved / loopback / link-local targets, require https in
 * production, and additionally resolve the hostname at delivery time to defend
 * against names that point at internal IPs (DNS-rebinding-style).
 */
import { lookup } from "node:dns/promises";

const PRIVATE_V4 = [
  /^0\./, // "this" network
  /^10\./, // private
  /^127\./, // loopback
  /^169\.254\./, // link-local incl. cloud metadata 169.254.169.254
  /^172\.(1[6-9]|2\d|3[01])\./, // private 172.16/12
  /^192\.168\./, // private
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT 100.64/10
];

function isPrivateIpv4(ip: string): boolean {
  return PRIVATE_V4.some((re) => re.test(ip));
}

function isPrivateIpv6(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  // IPv4-mapped IPv6 (::ffff:a.b.c.d) — validate the embedded v4 address.
  if (v.startsWith("::ffff:")) return isPrivateIpv4(v.slice("::ffff:".length));
  return (
    v === "::1" || // loopback
    v === "::" ||
    v.startsWith("fc") || // unique local
    v.startsWith("fd") ||
    v.startsWith("fe80") // link-local
  );
}

export function isPrivateIp(ip: string): boolean {
  return ip.includes(":") ? isPrivateIpv6(ip) : isPrivateIpv4(ip);
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata",
  "metadata.google.internal",
]);

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Structural, synchronous check — safe to run at creation time (no DNS). */
export function checkWebhookUrl(raw: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  const allowHttp = process.env.NODE_ENV !== "production";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && allowHttp)) {
    return { ok: false, reason: "Webhook URL must use https" };
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    BLOCKED_HOSTS.has(host) ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local")
  ) {
    return { ok: false, reason: "Webhook URL host is not allowed" };
  }

  // Literal IP host → reject private/reserved straight away.
  const looksLikeIp = /^[0-9.]+$/.test(host) || host.includes(":");
  if (looksLikeIp && isPrivateIp(host)) {
    return { ok: false, reason: "Webhook URL points to a private address" };
  }

  return { ok: true, url };
}

/**
 * Delivery-time check: structurally valid AND every resolved address is public.
 * Returns false (skip delivery) on any doubt.
 */
export async function isWebhookUrlDeliverable(raw: string): Promise<boolean> {
  const check = checkWebhookUrl(raw);
  if (!check.ok) return false;
  try {
    const results = await lookup(check.url.hostname, { all: true });
    return results.length > 0 && results.every((r) => !isPrivateIp(r.address));
  } catch {
    return false;
  }
}

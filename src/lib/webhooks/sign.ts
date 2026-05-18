import { createHmac, randomBytes } from "crypto";

export function generateWebhookSecret(): string {
  return randomBytes(24).toString("hex");
}

export function signWebhookPayload(secret: string, body: string, timestamp: string): string {
  const payload = `${timestamp}.${body}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(
  secret: string,
  body: string,
  timestamp: string,
  signature: string
): boolean {
  const expected = signWebhookPayload(secret, body, timestamp);
  return expected === signature;
}

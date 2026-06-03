import { describe, expect, it } from "vitest";
import { checkWebhookUrl, isPrivateIp } from "@/lib/webhooks/url-guard";

describe("isPrivateIp", () => {
  it("flags private / reserved IPv4", () => {
    for (const ip of [
      "127.0.0.1",
      "10.1.2.3",
      "192.168.0.1",
      "172.16.5.5",
      "172.31.255.255",
      "169.254.169.254", // cloud metadata
      "0.0.0.0",
      "100.64.0.1", // CGNAT
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("allows public IPv4", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "100.128.0.1"]) {
      expect(isPrivateIp(ip), ip).toBe(false);
    }
  });

  it("flags private IPv6 and loopback", () => {
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("fe80::1")).toBe(true);
    expect(isPrivateIp("fd00::1")).toBe(true);
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true); // IPv4-mapped loopback
    expect(isPrivateIp("2606:4700:4700::1111")).toBe(false); // public
  });
});

describe("checkWebhookUrl (SSRF guard)", () => {
  it("rejects internal / loopback / metadata targets", () => {
    for (const url of [
      "http://localhost/hook",
      "https://127.0.0.1/hook",
      "https://169.254.169.254/latest/meta-data/",
      "https://10.0.0.5/hook",
      "https://192.168.1.1/hook",
      "https://172.16.0.1/hook",
      "https://[::1]/hook",
      "https://metadata.google.internal/",
      "https://api.internal/hook",
      "https://service.local/hook",
    ]) {
      expect(checkWebhookUrl(url).ok, url).toBe(false);
    }
  });

  it("rejects malformed URLs", () => {
    expect(checkWebhookUrl("not a url").ok).toBe(false);
    expect(checkWebhookUrl("ftp://example.com/x").ok).toBe(false);
  });

  it("accepts public https endpoints", () => {
    for (const url of [
      "https://hooks.example.com/ingest",
      "https://8.8.8.8/hook",
      "https://api.acme.io/webhooks/ripple",
    ]) {
      expect(checkWebhookUrl(url).ok, url).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";

function textMatchesCompany(text: string, tokens: string[]): boolean {
  const lower = text.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

describe("company activity matching", () => {
  it("matches ingest headline when company token appears", () => {
    const tokens = ["apple", "inc"];
    expect(
      textMatchesCompany("Apple Inc supply chain delay at port", tokens)
    ).toBe(true);
    expect(textMatchesCompany("Unrelated weather event", tokens)).toBe(false);
  });
});

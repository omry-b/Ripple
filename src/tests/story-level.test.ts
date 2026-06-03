import { describe, expect, it } from "vitest";
import { levelFromStorySource } from "@/lib/intelligence/story-level";

describe("levelFromStorySource", () => {
  it("maps regulatory sources to elevated", () => {
    expect(levelFromStorySource("gdelt")).toBe("elevated");
    expect(levelFromStorySource("sec")).toBe("elevated");
  });

  it("maps news sources to normal", () => {
    expect(levelFromStorySource("news")).toBe("normal");
    expect(levelFromStorySource("npr")).toBe("normal");
  });
});

import { describe, expect, it } from "vitest";
import { mockStore } from "../lib/mock/store";

describe("mockStore", () => {
  it("returns companies with regions", () => {
    const companies = mockStore.getCompanies();
    expect(companies.length).toBeGreaterThan(5);
    expect(companies[0].region).toMatch(/APAC|EMEA|AMER/);
  });

  it("finds alert by id", () => {
    const alert = mockStore.getAlert("taiwan");
    expect(alert?.title).toContain("Taiwan");
  });

  it("search index includes companies", () => {
    const index = mockStore.getSearchIndex();
    expect(index.companies.length).toBeGreaterThan(0);
  });
});

import { test, expect } from "@playwright/test";

test("company search filter", async ({ page }) => {
  await page.goto("/companies");

  // Gate on hydration: the search box is only interactive once the client
  // component has hydrated, which also resolves the transient SSR+client
  // double-render of the table.
  const search = page.getByPlaceholder(/search/i);
  await search.waitFor({ state: "visible" });

  // Row-scoped locators (with .first()/toHaveCount) ignore the company-chip
  // legend above the table and stay robust to transient render states.
  const rows = page.locator(".risk-table tbody tr");
  await expect(rows.first()).toBeVisible(); // populated by default (regression guard)

  // Searching narrows the table to the match and drops non-matches.
  await search.fill("Apple");
  await expect(rows.filter({ hasText: /Apple Inc/i }).first()).toBeVisible();
  await expect(rows.filter({ hasText: /TSMC/i })).toHaveCount(0, { timeout: 10_000 });
});

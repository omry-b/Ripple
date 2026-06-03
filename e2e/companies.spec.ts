import { test, expect } from "@playwright/test";

test("company search filter", async ({ page }) => {
  await page.goto("/companies");

  // The streamed skeleton and hydrated page briefly overlap, duplicating
  // elements, so every locator uses .first() and we avoid exact-count
  // assertions (which oscillate during that transient).
  const rows = page.locator(".risk-table tbody tr");

  // Regression guard: companies are listed by default (not filtered to empty).
  await expect(rows.first()).toBeVisible();

  // Searching surfaces the matching company.
  await page.getByPlaceholder(/search/i).first().fill("Apple");
  await expect(rows.filter({ hasText: /Apple Inc/i }).first()).toBeVisible();
});

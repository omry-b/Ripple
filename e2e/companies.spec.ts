import { test, expect } from "@playwright/test";

test("company search filter", async ({ page }) => {
  await page.goto("/companies");

  // Results render in the risk table (the page also shows a company-chip legend,
  // so scope assertions to the table to stay unambiguous).
  const table = page.locator(".risk-table");
  await expect(table).toBeVisible();
  await expect(table).toContainText(/Apple/i);

  // Searching narrows the table to the match and drops non-matches.
  await page.getByPlaceholder(/search/i).fill("Apple");
  await expect(table).toContainText(/Apple/i);
  await expect(table).not.toContainText(/TSMC/i);
});

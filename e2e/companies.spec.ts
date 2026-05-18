import { test, expect } from "@playwright/test";

test("company search filter", async ({ page }) => {
  await page.goto("/companies");
  await page.getByPlaceholder(/search/i).fill("Apple");
  await expect(page.getByRole("link", { name: /Apple/i })).toBeVisible();
});

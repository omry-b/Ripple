import { test, expect } from "@playwright/test";

test("embed widget shows risk metrics", async ({ page }) => {
  await page.goto("/embed");
  await expect(page.getByText("Ripple Risk Index")).toBeVisible();
  await expect(page.getByText("Portfolio CVaR")).toBeVisible();
});

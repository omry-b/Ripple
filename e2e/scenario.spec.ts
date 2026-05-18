import { test, expect } from "@playwright/test";

test("scenario workbench runs simulation", async ({ page }) => {
  await page.goto("/scenario");
  await page.getByRole("button", { name: /Run Simulation/i }).first().click();
  await expect(page.locator(".run-history-list li").first()).toBeVisible({ timeout: 15_000 });
});

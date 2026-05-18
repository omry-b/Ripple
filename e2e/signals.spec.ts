import { test, expect } from "@playwright/test";

test("signal drawer opens and closes", async ({ page }) => {
  await page.goto("/signals");
  const card = page.locator(".stream-card-interactive").first();
  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel(/close signal/i).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

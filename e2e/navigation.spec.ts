import { test, expect } from "@playwright/test";

test("navigates main dashboard routes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toContainText("Ripple");
  await page.getByRole("tab", { name: "Signals" }).click();
  await expect(page).toHaveURL(/\/signals/);
  await page.getByRole("tab", { name: "Scenario" }).click();
  await expect(page).toHaveURL(/\/scenario/);
  await page.getByRole("tab", { name: "Companies" }).click();
  await expect(page).toHaveURL(/\/companies/);
});

import { test, expect } from "@playwright/test";

test("navigates main dashboard routes", async ({ page }) => {
  await page.goto("/");

  // Brand wordmark (home link) confirms the app shell rendered.
  await expect(page.locator("a.nav-brand")).toContainText("Ripple");

  // Route tabs are links inside the main nav landmark.
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeVisible();

  await nav.getByRole("link", { name: "Signals" }).click();
  await expect(page).toHaveURL(/\/signals/);

  await nav.getByRole("link", { name: "Scenario" }).click();
  await expect(page).toHaveURL(/\/scenario/);

  await nav.getByRole("link", { name: "Companies" }).click();
  await expect(page).toHaveURL(/\/companies/);
});

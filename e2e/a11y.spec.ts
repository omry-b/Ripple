import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/signals", "/companies", "/scenario", "/methodology"];

for (const path of ROUTES) {
  test(`axe: no critical violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");

    if (critical.length > 0) {
      console.log(JSON.stringify(critical, null, 2));
    }

    expect(critical, `critical a11y violations on ${path}`).toEqual([]);
  });
}

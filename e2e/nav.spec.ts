import { test, expect } from "@playwright/test";

test.describe("primary nav", () => {
  test("has no external GitHub link and shows exactly the four section tabs", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('#site-nav a[href*="github.com"]')).toHaveCount(0);

    const tabs = page.locator('#site-nav nav[aria-label="Primary"] ul > li > a');
    await expect(tabs).toHaveText(["Latest", "Data", "Dev", "Life"]);
  });
});

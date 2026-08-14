import { test, expect } from "@playwright/test";

test("home page head advertises the RSS feed via alternate link", async ({ page }) => {
  await page.goto("/");
  const rssLink = page.locator('link[rel="alternate"][type="application/rss+xml"]');
  await expect(rssLink).toHaveAttribute("href", /\/rss\.xml$/);
});

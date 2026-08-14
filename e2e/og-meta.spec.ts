import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";
import { deletePostIfExists, expectPostGone } from "./support/posts";

test.describe("post detail OG/Twitter meta tags", () => {
  test("renders og:title, og:description, og:url and a summary twitter card for a post with no thumbnail", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const title = `OG Meta Test ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(title);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-body-textarea").fill("This post has no image in its body.");
    await page.getByTestId("save-draft-button").click();

    try {
      await page.waitForURL((pageUrl) => /^\/posts\/[^/]+$/.test(pageUrl.pathname));
      const url = await page.evaluate(() => window.location.href);

      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        `${title} · hanul.dev`,
      );
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
        "content",
        "This post has no image in its body.",
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", url);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary",
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    } finally {
      try {
        await deletePostIfExists(page, title);
      } catch {
        // best effort — verified below, outside the finally block
      }
    }

    await expectPostGone(page, title);
  });
});

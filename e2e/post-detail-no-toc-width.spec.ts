import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("post detail layout without a table of contents", () => {
  test("article fills the full content width when the post has no H2/H3 headings", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const title = `No Heading Width Test ${Date.now()}`;

    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(title);
    await page.getByTestId("post-category-select").selectOption("SQL");
    // No "## "/"### " lines, so extractHeadings() returns [] and
    // TableOfContents renders nothing (#131).
    await page.getByTestId("post-body-textarea").fill("Just a plain paragraph, no headings.");
    await page.getByTestId("save-draft-button").click();

    try {
      await expect(page).toHaveURL(/\/admin\/posts$/);

      await page.goto("/");
      await page.getByTestId("post-card").filter({ hasText: title }).click();
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      await expect(page.getByTestId("toc")).toHaveCount(0);

      // The grid's second column (200px) plus its 3rem gap must fully
      // collapse away when there's no TOC to occupy it, or the article
      // renders ~248px narrower than the page's actual content width.
      const articleBox = await page.locator("article").boundingBox();
      expect(articleBox).not.toBeNull();
      expect(articleBox!.width).toBeGreaterThan(700);
    } finally {
      try {
        await page.goto("/admin/posts");
        const row = page.getByTestId("admin-post-row").filter({ hasText: title });
        if (await row.isVisible().catch(() => false)) {
          page.once("dialog", (dialog) => dialog.accept());
          await row.getByTestId("delete-post-button").click();
          await expect(row).toHaveCount(0);
        }
      } catch {
        // best effort — verified below, outside the finally block
      }
    }

    await page.goto("/admin/posts");
    await expect(page.getByTestId("admin-post-row").filter({ hasText: title })).toHaveCount(0);
  });
});

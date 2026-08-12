import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";
import { deletePostIfExists, expectPostGone } from "./support/posts";

test.describe("post detail date for drafts", () => {
  test("a draft's detail page shows a date to the admin instead of a blank meta line", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const title = `Draft Date Test ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(title);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-body-textarea").fill("## Draft\n\nDate fallback test.");
    await page.getByTestId("save-draft-button").click();

    // The draft above is already committed to the DB, so everything from
    // here on must be guarded by try/finally, or a failure partway through
    // leaks the draft permanently — same pattern as post-status-badge.spec.ts.
    try {
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      // publishedAt is null for a draft — the meta date must fall back to
      // createdAt instead of rendering an empty string.
      const dateText = await page.getByTestId("post-detail-date").innerText();
      expect(dateText.trim()).not.toBe("");
      expect(dateText.trim()).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
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

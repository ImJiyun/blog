import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

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
      await expect(page).toHaveURL(/\/admin\/posts$/);

      await page.goto("/");
      await page.getByTestId("post-card").filter({ hasText: title }).click();
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      // publishedAt is null for a draft — the meta date must fall back to
      // createdAt instead of rendering an empty string.
      const dateText = await page.getByTestId("post-detail-date").innerText();
      expect(dateText.trim()).not.toBe("");
      expect(dateText.trim()).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
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

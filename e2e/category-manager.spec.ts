import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("category manager", () => {
  test("add, use in a post, rename, and delete with reassignment", async ({ page }) => {
    await loginAsAdmin(page);

    const categoryName = `E2E Cat ${Date.now()}`;
    const renamedName = `${categoryName} Renamed`;
    const postTitle = `Category Manager Test ${Date.now()}`;

    await page.goto("/");
    await page.getByTestId("category-manager-button").click();
    await expect(page.getByTestId("category-manager-modal")).toBeVisible();

    await page.getByTestId("category-new-name-input").fill(categoryName);
    await page.getByTestId("category-new-section-select").selectOption("dev");
    await page.getByTestId("category-add-button").click();
    await expect(
      page.getByTestId("category-row").filter({ hasText: categoryName }),
    ).toBeVisible();
    await page.getByTestId("category-manager-close").click();

    try {
      // The new category must be selectable when writing a post.
      await page.goto("/admin/posts/new");
      await page.getByTestId("post-title-input").fill(postTitle);
      await page
        .getByTestId("post-category-select")
        .selectOption({ label: categoryName });
      await page.getByTestId("post-body-textarea").fill("본문 내용");
      await page.getByTestId("save-draft-button").click();
      await expect(page).toHaveURL(/\/admin\/posts$/);

      // Rename it — the already-created post should reflect the new name.
      await page.goto("/");
      await page.getByTestId("category-manager-button").click();
      const row = page.getByTestId("category-row").filter({ hasText: categoryName });
      await row.getByTestId("category-rename-start").click();
      await page.getByTestId("category-rename-input").fill(renamedName);
      await page.getByTestId("category-rename-confirm").click();
      await expect(
        page.getByTestId("category-row").filter({ hasText: renamedName }),
      ).toBeVisible();
      await page.getByTestId("category-manager-close").click();

      // Admin's post list only links to the edit page (no public-view link
      // for drafts), so follow that link rather than the ambiguous row click
      // the design draft assumed — and check the category select's value
      // rather than /posts/[slug], which a draft wouldn't resolve to anyway.
      await page.goto("/admin/posts");
      const postRow = page.getByTestId("admin-post-row").filter({ hasText: postTitle });
      await postRow.getByRole("link", { name: "Edit" }).click();
      await expect(page).toHaveURL(/\/admin\/posts\/[^/]+\/edit$/);
      await expect(page.getByTestId("post-category-select")).toHaveValue(renamedName);

      // Delete it, reassigning its one post to SQL.
      await page.goto("/");
      await page.getByTestId("category-manager-button").click();
      const renamedRow = page.getByTestId("category-row").filter({ hasText: renamedName });
      await renamedRow.getByTestId("category-delete-start").click();
      await renamedRow
        .getByTestId("category-reassign-select")
        .selectOption({ label: "SQL(으)로 이동" });
      await renamedRow.getByTestId("category-delete-confirm").click();
      await expect(
        page.getByTestId("category-row").filter({ hasText: renamedName }),
      ).toHaveCount(0);
      await page.getByTestId("category-manager-close").click();
    } finally {
      try {
        await page.goto("/admin/posts");
        const row = page.getByTestId("admin-post-row").filter({ hasText: postTitle });
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
    await expect(page.getByTestId("admin-post-row").filter({ hasText: postTitle })).toHaveCount(0);
  });
});

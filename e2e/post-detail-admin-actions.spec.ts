import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";
import { deletePostIfExists } from "./support/posts";

test.describe("post detail admin actions", () => {
  test("is hidden for a signed-out visitor", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.getByTestId("post-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(page.getByTestId("post-detail-delete-button")).not.toBeVisible();
  });

  test("edit link goes to the admin edit page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/");
    await page.getByTestId("post-card").first().click();
    await page.getByRole("link", { name: "수정" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/.+\/edit$/);
  });

  test("delete removes the post and redirects home", async ({ page }) => {
    await loginAsAdmin(page);
    const title = `Delete Test ${Date.now()}`;

    // Create a post owned by this test rather than deleting "the first post
    // card on the homepage" — that shared-state pattern raced with other
    // specs (e.g. smoke.spec.ts) that also publish/look up their own post
    // under parallel workers.
    await page.goto("/");
    await page.getByTestId("admin-fab-new-post").click();
    await expect(page).toHaveURL(/\/admin\/posts\/new$/);
    await page.getByTestId("post-title-input").fill(title);
    await page.getByTestId("post-subtitle-input").fill("Delete test subtitle");
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-tags-input").fill("test");
    await page.getByTestId("post-body-textarea").fill("Delete test body.");
    await page.getByTestId("publish-button").click();
    await expect(page).toHaveURL(/\/posts\/[^/]+$/);
    await expect(page.getByText(title)).toBeVisible();

    // If the delete click below fails, the post created above would
    // otherwise leak into the DB permanently — clean it up as a fallback
    // whenever the primary flow didn't already delete it.
    try {
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByTestId("post-detail-delete-button").click();

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByText(title)).not.toBeVisible();
    } finally {
      try {
        await deletePostIfExists(page, title);
      } catch {
        // best effort — the assertions above already caught the real failure
      }
    }
  });
});

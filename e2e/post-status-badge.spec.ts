import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("post status badge", () => {
  test("shows 임시저장 for a draft and 비공개 for a private published post", async ({ page }) => {
    await loginAsAdmin(page);

    const draftTitle = `Draft Badge Test ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(draftTitle);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-body-textarea").fill("## Draft\n\nBadge test.");
    await page.getByTestId("save-draft-button").click();
    await expect(page).toHaveURL(/\/admin\/posts$/);

    const privateTitle = `Private Badge Test ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(privateTitle);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-body-textarea").fill("## Private\n\nBadge test.");
    await page.getByTestId("post-public-toggle").click();
    await page.getByTestId("publish-button").click();
    await expect(page).toHaveURL(/\/admin\/posts$/);

    try {
      await page.goto("/");

      const draftCard = page.getByTestId("post-card").filter({ hasText: draftTitle });
      await expect(draftCard.getByTestId("post-status-badge")).toHaveText("임시저장");

      const privateCard = page.getByTestId("post-card").filter({ hasText: privateTitle });
      await expect(privateCard.getByTestId("post-status-badge")).toHaveText("비공개");
    } finally {
      // Clean up the draft post
      await page.goto("/admin/posts");
      const draftRow = page.getByTestId("admin-post-row").filter({ hasText: draftTitle });
      if (await draftRow.isVisible().catch(() => false)) {
        page.once("dialog", (dialog) => dialog.accept());
        await draftRow.getByTestId("delete-post-button").click();
        // Wait for the post to be deleted
        await page.goto("/admin/posts");
        await expect(page.getByTestId("admin-post-row").filter({ hasText: draftTitle })).toHaveCount(0);
      }

      // Clean up the private post
      await page.goto("/admin/posts");
      const privateRow = page.getByTestId("admin-post-row").filter({ hasText: privateTitle });
      if (await privateRow.isVisible().catch(() => false)) {
        page.once("dialog", (dialog) => dialog.accept());
        await privateRow.getByTestId("delete-post-button").click();
        // Wait for the post to be deleted
        await page.goto("/admin/posts");
        await expect(page.getByTestId("admin-post-row").filter({ hasText: privateTitle })).toHaveCount(0);
      }
    }
  });
});

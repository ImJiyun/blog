import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("post status badge", () => {
  test("shows 임시저장 for a draft and 비공개 for a private published post", async ({ page }) => {
    await loginAsAdmin(page);

    const draftTitle = `Draft Badge Test ${Date.now()}`;
    const privateTitle = `Private Badge Test ${Date.now()}`;

    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(draftTitle);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-body-textarea").fill("## Draft\n\nBadge test.");
    await page.getByTestId("save-draft-button").click();

    // The draft above is already committed to the DB, so everything from
    // here on — including the private post's own creation flow — must be
    // guarded by try/finally, or a failure partway through leaks the draft
    // (and/or the private post) permanently. See admin-draft-visibility.spec.ts
    // for the same pattern.
    try {
      await expect(page).toHaveURL(/\/admin\/posts$/);

      await page.goto("/admin/posts/new");
      await page.getByTestId("post-title-input").fill(privateTitle);
      await page.getByTestId("post-category-select").selectOption("SQL");
      await page.getByTestId("post-body-textarea").fill("## Private\n\nBadge test.");
      await page.getByTestId("post-public-toggle").click();
      await page.getByTestId("publish-button").click();
      await expect(page).toHaveURL(/\/admin\/posts$/);

      await page.goto("/");

      const draftCard = page.getByTestId("post-card").filter({ hasText: draftTitle });
      await expect(draftCard.getByTestId("post-status-badge")).toHaveText("임시저장");

      const privateCard = page.getByTestId("post-card").filter({ hasText: privateTitle });
      await expect(privateCard.getByTestId("post-status-badge")).toHaveText("비공개");
    } finally {
      // Clean up the draft post. Isolated in its own try/catch so a failure
      // here can never prevent the private-post cleanup below from running.
      try {
        await page.goto("/admin/posts");
        const draftRow = page.getByTestId("admin-post-row").filter({ hasText: draftTitle });
        if (await draftRow.isVisible().catch(() => false)) {
          page.once("dialog", (dialog) => dialog.accept());
          await draftRow.getByTestId("delete-post-button").click();
          // Wait for the row to disappear from this same page (the delete
          // button's onSuccess triggers an in-place router.refresh()) before
          // navigating anywhere else. Without this, a later goto can race
          // the still-in-flight DELETE request and read stale data — the
          // navigation itself can even abort the request client-side.
          await expect(draftRow).toHaveCount(0);
        }
      } catch {
        // best effort — verified below, outside the finally block
      }

      // Clean up the private post
      try {
        await page.goto("/admin/posts");
        const privateRow = page.getByTestId("admin-post-row").filter({ hasText: privateTitle });
        if (await privateRow.isVisible().catch(() => false)) {
          page.once("dialog", (dialog) => dialog.accept());
          await privateRow.getByTestId("delete-post-button").click();
          await expect(privateRow).toHaveCount(0);
        }
      } catch {
        // best effort — verified below, outside the finally block
      }
    }

    // Confirm the deletes actually took effect, rather than just trusting
    // the clicks succeeded. Done outside finally so a failure here surfaces
    // as the test's real failure instead of masking one thrown above.
    await page.goto("/admin/posts");
    await expect(page.getByTestId("admin-post-row").filter({ hasText: draftTitle })).toHaveCount(0);
    await expect(page.getByTestId("admin-post-row").filter({ hasText: privateTitle })).toHaveCount(0);
  });
});

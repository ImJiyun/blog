import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";
import { deletePostIfExists, expectPostGone } from "./support/posts";

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
    // (and/or the private post) permanently.
    try {
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      await page.goto("/admin/posts/new");
      await page.getByTestId("post-title-input").fill(privateTitle);
      await page.getByTestId("post-category-select").selectOption("SQL");
      await page.getByTestId("post-body-textarea").fill("## Private\n\nBadge test.");
      await page.getByTestId("post-public-toggle").click();
      await page.getByTestId("publish-button").click();
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      await page.goto("/");

      const draftCard = page.getByTestId("post-card").filter({ hasText: draftTitle });
      await expect(draftCard.getByTestId("post-status-badge")).toHaveText("임시저장");

      const privateCard = page.getByTestId("post-card").filter({ hasText: privateTitle });
      await expect(privateCard.getByTestId("post-status-badge")).toHaveText("비공개");

      // The detail page must show the same status the card did (#127) — neither
      // post has a thumbnail, so this also covers the no-thumbnail case.
      await draftCard.click();
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);
      await expect(page.getByTestId("post-status-badge")).toHaveText("임시저장");
      await page.goBack();

      await privateCard.click();
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);
      await expect(page.getByTestId("post-status-badge")).toHaveText("비공개");
      await page.goBack();
    } finally {
      // Clean up the draft post. Isolated in its own try/catch so a failure
      // here can never prevent the private-post cleanup below from running.
      try {
        await deletePostIfExists(page, draftTitle);
      } catch {
        // best effort — verified below, outside the finally block
      }

      // Clean up the private post
      try {
        await deletePostIfExists(page, privateTitle);
      } catch {
        // best effort — verified below, outside the finally block
      }
    }

    // Confirm the deletes actually took effect, rather than just trusting
    // the clicks succeeded. Done outside finally so a failure here surfaces
    // as the test's real failure instead of masking one thrown above.
    await expectPostGone(page, draftTitle);
    await expectPostGone(page, privateTitle);
  });
});

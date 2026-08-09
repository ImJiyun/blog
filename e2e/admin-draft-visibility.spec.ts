import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("admin draft visibility on public pages", () => {
  test("a draft post appears on home for admin but not for a signed-out visitor", async ({
    page,
    browser,
  }) => {
    await loginAsAdmin(page);
    const title = `Draft Visibility Test ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(title);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-body-textarea").fill("## Draft\n\nNot published yet.");
    await page.getByTestId("save-draft-button").click();
    await expect(page).toHaveURL(/\/admin\/posts$/);

    // The draft above only lives in the DB until we delete it below — if any
    // assertion fails first, it would otherwise leak into the DB permanently
    // (the same cross-spec-pollution risk fixed in
    // post-detail-admin-actions.spec.ts), so clean it up via the admin list
    // as a fallback whenever the primary flow below didn't already delete it.
    try {
      await page.goto("/");
      await expect(page.getByText(title)).toBeVisible();

      const signedOutContext = await browser.newContext();
      const signedOutPage = await signedOutContext.newPage();
      await signedOutPage.goto("/");
      await expect(signedOutPage.getByText(title)).not.toBeVisible();
      await signedOutContext.close();
    } finally {
      await page.goto("/admin/posts");
      const row = page.getByTestId("admin-post-row").filter({ hasText: title });
      if (await row.isVisible().catch(() => false)) {
        page.once("dialog", (dialog) => dialog.accept());
        await row.getByTestId("delete-post-button").click();
      }
    }

    // Confirm the delete actually took effect, rather than just trusting the
    // click succeeded.
    await page.goto("/admin/posts");
    await expect(page.getByTestId("admin-post-row").filter({ hasText: title })).toHaveCount(0);
  });
});

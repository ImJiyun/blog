import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";
import { deletePostIfExists, expectPostGone } from "./support/posts";

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

    // The draft above is already committed to the DB, so everything from
    // here on must be guarded by try/finally, or a failure partway through
    // leaks the draft permanently.
    try {
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      await page.goto("/");
      await expect(page.getByText(title)).toBeVisible();

      const signedOutContext = await browser.newContext();
      const signedOutPage = await signedOutContext.newPage();
      await signedOutPage.goto("/");
      await expect(signedOutPage.getByText(title)).not.toBeVisible();
      await signedOutContext.close();
    } finally {
      try {
        await deletePostIfExists(page, title);
      } catch {
        // best effort — verified below, outside the finally block
      }
    }

    // Confirm the delete actually took effect, rather than just trusting the
    // click succeeded.
    await expectPostGone(page, title);
  });
});

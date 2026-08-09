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

    await page.goto("/");
    await expect(page.getByText(title)).toBeVisible();

    const signedOutContext = await browser.newContext();
    const signedOutPage = await signedOutContext.newPage();
    await signedOutPage.goto("/");
    await expect(signedOutPage.getByText(title)).not.toBeVisible();
    await signedOutContext.close();
  });
});

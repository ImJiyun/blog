import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("post detail admin actions", () => {
  test("is hidden for a signed-out visitor", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("post-card").first().click();
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
    await page.goto("/");
    const title = await page.getByTestId("post-card").first().locator("h3").innerText();
    await page.getByTestId("post-card").first().click();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("post-detail-delete-button").click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(title)).not.toBeVisible();
  });
});

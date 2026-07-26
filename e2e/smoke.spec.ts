import { test, expect } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "test-password";
const POST_TITLE = `Playwright Smoke Post ${Date.now()}`;

test.describe.serial("golden path: write, publish, list, comment, like", () => {
  test("admin logs in and publishes a post", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByTestId("password-input").fill(ADMIN_PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/admin\/posts$/);

    await page.getByTestId("new-post-link").click();
    await expect(page).toHaveURL(/\/admin\/posts\/new$/);

    await page.getByTestId("post-title-input").fill(POST_TITLE);
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-tags-input").fill("smoke, playwright");
    await page
      .getByTestId("post-body-textarea")
      .fill("## Intro\n\nThis post was published by the Playwright smoke test.");
    await page.getByTestId("publish-button").click();

    await expect(page).toHaveURL(/\/admin\/posts$/);
    await expect(page.getByText(POST_TITLE)).toBeVisible();
  });

  test("the published post appears in the public list", async ({ page }) => {
    await page.goto("/posts");
    await expect(page.getByText(POST_TITLE)).toBeVisible();
  });

  test("a visitor comments on and likes the post", async ({ page }) => {
    await page.goto("/posts");
    await page.getByText(POST_TITLE).click();
    await expect(page).toHaveURL(/\/posts\//);

    await page.getByTestId("comment-author-input").fill("Playwright Visitor");
    await page.getByTestId("comment-body-input").fill("Great post, testing comments!");
    await page.getByTestId("comment-submit").click();
    await expect(page.getByText("Great post, testing comments!")).toBeVisible();

    const likeButton = page.getByTestId("like-button");
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    await likeButton.click();
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
  });
});

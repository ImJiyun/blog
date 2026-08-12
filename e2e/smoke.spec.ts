import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

const POST_TITLE = `Playwright Smoke Post ${Date.now()}`;

test.describe.serial("golden path: write, publish, list, comment, like", () => {
  test("admin logs in and publishes a post", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/");

    await page.getByTestId("admin-fab-new-post").click();
    await expect(page).toHaveURL(/\/admin\/posts\/new$/);

    await page.getByTestId("post-title-input").fill(POST_TITLE);
    await page.getByTestId("post-subtitle-input").fill("스모크 테스트용 부제입니다");
    await page.getByTestId("post-category-select").selectOption("SQL");
    await page.getByTestId("post-tags-input").fill("smoke, playwright");
    await page
      .getByTestId("post-body-textarea")
      .fill("## Intro\n\nThis post was published by the Playwright smoke test.");
    await page.getByTestId("publish-button").click();

    await expect(page).toHaveURL(/\/posts\/[^/]+$/);
    await expect(page.getByText(POST_TITLE)).toBeVisible();
  });

  test("the subtitle round-trips through the edit form", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/");
    await page.getByTestId("post-card").filter({ hasText: POST_TITLE }).click();
    await page.getByRole("link", { name: "수정" }).click();
    await expect(page.getByTestId("post-subtitle-input")).toHaveValue(
      "스모크 테스트용 부제입니다",
    );
  });

  test("the detail page shows the redesigned layout", async ({ page }) => {
    await page.goto("/posts");
    await page.getByText(POST_TITLE).click();
    await expect(page).toHaveURL(/\/posts\//);

    // subtitle rendered
    await expect(page.getByText("스모크 테스트용 부제입니다")).toBeVisible();

    // tags rendered above the title, not just at the bottom of the article —
    // this post was tagged "smoke, playwright" at creation time
    const tagsBlock = page.getByTestId("post-tags");
    await expect(tagsBlock).toBeVisible();
    await expect(tagsBlock.getByText("#smoke")).toBeVisible();

    // author card always renders (static content)
    await expect(page.getByTestId("post-author-card")).toBeVisible();
    await expect(page.getByText("데이터와 일상을 기록합니다")).toBeVisible();
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

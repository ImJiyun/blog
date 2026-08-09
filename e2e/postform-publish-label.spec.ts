import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("post form publish label", () => {
  test("publish button label follows the public/private toggle", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/posts/new");

    await expect(page.getByTestId("publish-button")).toHaveText("공개로 게시");

    await page.getByTestId("post-public-toggle").click();
    await expect(page.getByTestId("publish-button")).toHaveText("비공개로 게시");

    await expect(page.getByTestId("cancel-button")).toHaveText("취소");
    await expect(page.getByTestId("save-draft-button")).toHaveText("임시 저장");
  });
});

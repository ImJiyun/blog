import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

const FAB = "admin-fab-new-post";
const ALLOWED_PATHS = ["/", "/study", "/life", "/project", "/posts"];

test.describe("admin FAB", () => {
  test("is hidden for a signed-out visitor on every public list page", async ({ page }) => {
    for (const path of ALLOWED_PATHS) {
      await page.goto(path);
      await expect(page.getByTestId(FAB)).not.toBeVisible();
    }
  });

  test("appears on every public list page once logged in, and hides on a non-list page", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    for (const path of ALLOWED_PATHS) {
      await page.goto(path);
      await expect(page.getByTestId(FAB)).toBeVisible();
    }

    await page.goto("/admin/posts");
    await expect(page.getByTestId(FAB)).not.toBeVisible();
  });

  test("clicking it navigates to the new-post page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/study");
    await page.getByTestId(FAB).click();
    await expect(page).toHaveURL(/\/admin\/posts\/new$/);
  });
});

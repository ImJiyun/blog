import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";

test.describe("admin mode badge", () => {
  test("is hidden for a signed-out visitor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("admin-mode-badge")).not.toBeVisible();
  });

  test("appears after login and logs out on click", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("admin-mode-badge")).toBeVisible();

    await page.getByTestId("admin-mode-badge").click();
    await expect(page.getByTestId("admin-mode-badge")).not.toBeVisible();
  });
});

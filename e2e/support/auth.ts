import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// webServer spawns `next start`, which reads .env.local directly — it doesn't
// go through tests/setup.ts (Vitest-only), so .env.local's ADMIN_PASSWORD_HASH
// must already match this password before running `npm run test:e2e`, e.g.:
//   node -e "console.log(require('bcryptjs').hashSync('test-password', 10))"
// (Injecting the hash via webServer.env instead doesn't work: Next's dotenv
// loader re-runs its $VAR interpolation on a key's value once per env file
// that also declares it, which mangles a literal bcrypt hash — .env and
// .env.local both declare ADMIN_PASSWORD_HASH, so it gets corrupted twice.)
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "test-password";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/");
  // The keydown listener only attaches after React hydration finishes, so a
  // keypress fired before that point is dropped rather than queued. Retry
  // until the modal is actually visible instead of racing hydration.
  await expect(async () => {
    await page.keyboard.press("ControlOrMeta+Shift+K");
    await expect(page.getByTestId("admin-login-modal")).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
  await page.getByTestId("password-input").fill(ADMIN_PASSWORD);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("admin-login-modal")).not.toBeVisible();
  // Successful login should refresh in place, not navigate away.
  await expect(page).toHaveURL(/\/$/);
}

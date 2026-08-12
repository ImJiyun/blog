import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Best-effort test cleanup: finds a post by title on the home feed (drafts
// and private posts show there too when logged in as admin, via
// getViewablePosts) and deletes it through its detail page's admin delete
// button. No-op if the card isn't there — e.g. the test's own happy path
// already deleted it. Callers that want a cleanup failure to surface wrap
// this in their own try/catch, same as the inline delete blocks it replaces.
export async function deletePostIfExists(page: Page, title: string): Promise<void> {
  await page.goto("/");
  const card = page.getByTestId("post-card").filter({ hasText: title });
  if (!(await card.isVisible().catch(() => false))) return;
  await card.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+$/);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("post-detail-delete-button").click();
  await expect(page).toHaveURL(/\/$/);
}

// Confirms a post with the given title is gone from the home feed —
// verifies the delete actually took effect rather than just trusting the
// click succeeded.
export async function expectPostGone(page: Page, title: string): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("post-card").filter({ hasText: title })).toHaveCount(0);
}

import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Best-effort test cleanup: finds a post by title on the /posts list (drafts
// and private posts show there too when logged in as admin, via
// getViewablePosts) and deletes it through its detail page's admin delete
// button. No-op if the card isn't there — e.g. the test's own happy path
// already deleted it. Callers that want a cleanup failure to surface wrap
// this in their own try/catch, same as the inline delete blocks it replaces.
//
// Navigates to /posts rather than / (home): home filters out any category
// whose section is "life" (see src/app/page.tsx), so a post in a life-section
// category would never show there and this helper would silently no-op,
// leaking the post into the DB. /posts applies no such filter — it's a
// strict superset of home with the same draft/private-for-admin visibility.
export async function deletePostIfExists(page: Page, title: string): Promise<void> {
  await page.goto("/posts");
  const card = page.getByTestId("post-card").filter({ hasText: title });
  if (!(await card.isVisible().catch(() => false))) return;
  await card.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+$/);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("post-detail-delete-button").click();
  await expect(page).toHaveURL(/\/$/);
}

// Confirms a post with the given title is gone from the /posts list —
// verifies the delete actually took effect rather than just trusting the
// click succeeded. See deletePostIfExists above for why /posts, not /, is
// the right place to check.
export async function expectPostGone(page: Page, title: string): Promise<void> {
  await page.goto("/posts");
  await expect(page.getByTestId("post-card").filter({ hasText: title })).toHaveCount(0);
}

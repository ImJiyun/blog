import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./support/auth";
import { deletePostIfExists, expectPostGone } from "./support/posts";

test.describe("code block and inline code accent highlighting", () => {
  test("fenced block extends accent to function titles, inline code highlights exact keywords only", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const title = `Code Highlight Test ${Date.now()}`;
    const body = [
      "## Code highlight test",
      "",
      "```python",
      'def calculate_score(row):',
      '    if row["value"] > 0:',
      '        return "positive"',
      "```",
      "",
      "Use `if` to branch, but `Series.where()` is just a call.",
    ].join("\n");

    await page.goto("/admin/posts/new");
    await page.getByTestId("post-title-input").fill(title);
    await page.getByTestId("post-category-select").selectOption("Python");
    await page.getByTestId("post-body-textarea").fill(body);
    await page.getByTestId("save-draft-button").click();

    try {
      await expect(page).toHaveURL(/\/posts\/[^/]+$/);

      const article = page.locator("article");

      // Fenced block: keyword and function-title tokens must share the
      // same accent color, and that color must differ from a string token.
      const fencedKeyword = article.locator(".hljs-keyword").first();
      const fencedFunctionTitle = article.locator(".hljs-title.function_").first();
      const fencedString = article.locator(".hljs-string").first();

      await expect(fencedKeyword).toBeVisible();
      await expect(fencedFunctionTitle).toBeVisible();
      await expect(fencedString).toBeVisible();

      // Regression guard for a prior bug: react-markdown injects a `node`
      // hast-AST prop into custom components, and CodeRenderer used to spread
      // it straight onto the DOM element, leaking node="[object Object]" onto
      // every code span. Confirm it no longer appears.
      expect(await fencedKeyword.evaluate((el) => el.getAttribute("node"))).toBeNull();

      const [keywordColor, functionTitleColor, stringColor] = await Promise.all([
        fencedKeyword.evaluate((el) => getComputedStyle(el).color),
        fencedFunctionTitle.evaluate((el) => getComputedStyle(el).color),
        fencedString.evaluate((el) => getComputedStyle(el).color),
      ]);
      expect(functionTitleColor).toBe(keywordColor);
      expect(stringColor).not.toBe(keywordColor);

      // Inline code lives inside the paragraph text (never inside a <pre>),
      // so scoping to "p code" unambiguously picks the inline spans out of
      // the fenced block above.
      const inlineKeyword = article.locator("p code", { hasText: "if" }).first();
      const inlineNonKeyword = article
        .locator("p code", { hasText: "Series.where()" })
        .first();

      await expect(inlineKeyword).toBeVisible();
      await expect(inlineNonKeyword).toBeVisible();

      const inlineKeywordColor = await inlineKeyword
        .locator("span")
        .first()
        .evaluate((el) => getComputedStyle(el).color);

      expect(inlineKeywordColor).toBe(keywordColor);
      // The non-keyword's own <code> color is always the paragraph ink color
      // regardless of whether an accent span leaked inside it, so comparing
      // getComputedStyle on the <code> element itself can never fail — assert
      // structurally instead: no accent <span> was created inside it at all.
      await expect(inlineNonKeyword.locator("span")).toHaveCount(0);
    } finally {
      try {
        await deletePostIfExists(page, title);
      } catch {
        // best effort — verified below, outside the finally block
      }
    }

    await expectPostGone(page, title);
  });
});

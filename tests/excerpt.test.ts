import { describe, it, expect } from "vitest";
import { toExcerpt } from "@/lib/excerpt";

describe("toExcerpt", () => {
  it("returns plain text unchanged if shorter than maxLength", () => {
    const text = "This is a short plain text excerpt.";
    expect(toExcerpt(text)).toBe(text);
  });

  it("trims leading and trailing whitespace", () => {
    const text = "  Some text with spaces  ";
    expect(toExcerpt(text)).toBe("Some text with spaces");
  });

  it("truncates text longer than maxLength at word boundary with ellipsis", () => {
    const text = "This is a longer piece of text that exceeds the default two hundred character limit and should be truncated at a word boundary when the full content is much longer than expected for a reasonable excerpt length.";
    expect(text.length).toBeGreaterThan(200); // verify test text is actually long enough
    const result = toExcerpt(text);
    expect(result).toContain("…");
    expect(result.length).toBeLessThanOrEqual(201); // 200 + ellipsis
  });

  it("truncates at custom maxLength", () => {
    const text = "One two three four five six seven eight nine ten";
    const result = toExcerpt(text, 20);
    expect(result).toBe("One two three four…");
  });

  it("removes headers (# Title)", () => {
    const text = "# Main Title\n\nSome content here";
    const result = toExcerpt(text);
    expect(result).not.toContain("#");
    expect(result).toContain("Main Title");
    expect(result).toContain("Some content here");
  });

  it("removes multiple header levels", () => {
    const text = "# H1\n## H2\n### H3\nContent";
    const result = toExcerpt(text);
    expect(result).not.toContain("#");
    expect(result).toContain("H1");
    expect(result).toContain("H2");
    expect(result).toContain("H3");
  });

  it("removes bold markers (**text**)", () => {
    const text = "This is **bold text** in a sentence.";
    const result = toExcerpt(text);
    expect(result).not.toContain("**");
    expect(result).toContain("bold text");
  });

  it("removes italic markers (*text*)", () => {
    const text = "This is *italic text* in a sentence.";
    const result = toExcerpt(text);
    expect(result).not.toContain("*");
    expect(result).toContain("italic text");
  });

  it("removes strikethrough markers (~~text~~)", () => {
    const text = "This is ~~strikethrough~~ text.";
    const result = toExcerpt(text);
    expect(result).not.toContain("~~");
    expect(result).toContain("strikethrough");
  });

  it("converts inline code to plain text", () => {
    const text = "Use the `console.log()` function to debug.";
    const result = toExcerpt(text);
    expect(result).not.toContain("`");
    expect(result).toContain("console.log()");
  });

  it("converts links to link text", () => {
    const text = "Visit [my blog](https://example.com) for more info.";
    const result = toExcerpt(text);
    expect(result).not.toContain("[");
    expect(result).not.toContain("]");
    expect(result).not.toContain("(https://example.com)");
    expect(result).toContain("my blog");
  });

  it("converts images to alt text", () => {
    const text = "Here is an ![hero image](https://example.com/hero.jpg) in the text.";
    const result = toExcerpt(text);
    expect(result).not.toContain("![");
    expect(result).not.toContain("](https://example.com/hero.jpg)");
    expect(result).toContain("hero image");
  });

  it("removes fenced code blocks entirely", () => {
    const text = "Some intro text\n\n```python\ndef hello():\n    print('world')\n```\n\nAnd some outro text.";
    const result = toExcerpt(text);
    expect(result).not.toContain("```");
    expect(result).not.toContain("def hello");
    expect(result).not.toContain("print");
    expect(result).toContain("intro text");
    expect(result).toContain("outro text");
  });

  it("removes code blocks with different fence styles", () => {
    const text = "Intro\n```\nlet x = 1;\n```\nOutro";
    const result = toExcerpt(text);
    expect(result).not.toContain("let x");
    expect(result).toContain("Intro");
    expect(result).toContain("Outro");
  });

  it("collapses multiple newlines to single spaces", () => {
    const text = "First line\n\n\nSecond line\n\nThird line";
    const result = toExcerpt(text);
    expect(result).toBe("First line Second line Third line");
  });

  it("collapses multiple spaces to single space", () => {
    const text = "Text  with   multiple    spaces";
    const result = toExcerpt(text);
    expect(result).toBe("Text with multiple spaces");
  });

  it("handles blockquotes", () => {
    const text = "Some text\n> A quote\n> Another line\nMore text";
    const result = toExcerpt(text);
    expect(result).not.toContain(">");
    expect(result).toContain("A quote");
    expect(result).toContain("Another line");
  });

  it("handles complex markdown with multiple features", () => {
    const text = "# My Post\n\nThis is **bold** and *italic* text with a [link](https://example.com).\n\n```js\nconst x = 1;\n```\n\nMore content with `code` and ![image](url).";
    const result = toExcerpt(text);
    expect(result).not.toContain("#");
    expect(result).not.toContain("**");
    expect(result).not.toContain("*");
    expect(result).not.toContain("[");
    expect(result).not.toContain("`");
    expect(result).not.toContain("![");
    expect(result).not.toContain("const x");
    expect(result).toContain("My Post");
    expect(result).toContain("bold");
    expect(result).toContain("italic");
    expect(result).toContain("link");
    expect(result).toContain("More content");
    expect(result).toContain("code");
    expect(result).toContain("image");
  });

  it("handles empty string", () => {
    expect(toExcerpt("")).toBe("");
  });

  it("handles string with only whitespace", () => {
    expect(toExcerpt("   \n\n  \t  ")).toBe("");
  });

  it("does not add ellipsis when text fits within maxLength", () => {
    const text = "One two three";
    const result = toExcerpt(text, 20);
    expect(result).toBe("One two three");
    expect(result).not.toContain("…");
  });
});

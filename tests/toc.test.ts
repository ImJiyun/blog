import { describe, it, expect } from "vitest";
import { extractHeadings } from "@/lib/toc";

describe("extractHeadings", () => {
  it("extracts h2 and h3 headings with slugified ids", () => {
    const markdown =
      "# Title\n\n## First Section\n\nbody\n\n### Nested Point\n\nmore body";
    expect(extractHeadings(markdown)).toEqual([
      { id: "first-section", text: "First Section", level: 2 },
      { id: "nested-point", text: "Nested Point", level: 3 },
    ]);
  });

  it("ignores h1 and h4+ headings", () => {
    const markdown = "# Title\n\n#### Too deep\n\nbody";
    expect(extractHeadings(markdown)).toEqual([]);
  });

  it("de-duplicates repeated heading text the same way github-slugger does", () => {
    const markdown = "## Setup\n\nbody\n\n## Setup\n\nmore body";
    expect(extractHeadings(markdown).map((h) => h.id)).toEqual(["setup", "setup-1"]);
  });

  it("returns an empty array for a body with no headings", () => {
    expect(extractHeadings("just a paragraph, no headings")).toEqual([]);
  });

  it("keeps slug ids in sync with rehype-slug's whole-document occurrence count, even across excluded heading levels", () => {
    // rehype-slug slugs every heading (h1-h6) in one pass over the rendered
    // document, so a duplicate "Setup" at an excluded level (h4) still
    // consumes a slugger occurrence before the next h2 "Setup" is reached.
    const markdown = "## Setup\n\n### Detail\n\n#### Setup\n\n## Setup";
    expect(extractHeadings(markdown)).toEqual([
      { id: "setup", text: "Setup", level: 2 },
      { id: "detail", text: "Detail", level: 3 },
      { id: "setup-2", text: "Setup", level: 2 },
    ]);
  });

  it("ignores heading-shaped lines inside fenced code blocks", () => {
    // rehype-slug parses the real markdown AST and never treats a
    // `#`-prefixed line inside a fence as a heading, so extractHeadings must
    // strip fences first — otherwise a code comment like "## Setup" both adds
    // a bogus ToC entry and desyncs the slugger count for real headings after it.
    const markdown =
      "## Setup\n\nintro\n\n```python\n## Setup\nimport pandas\n```\n\n## Setup";
    expect(extractHeadings(markdown)).toEqual([
      { id: "setup", text: "Setup", level: 2 },
      { id: "setup-1", text: "Setup", level: 2 },
    ]);
  });
});

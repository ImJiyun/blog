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
});

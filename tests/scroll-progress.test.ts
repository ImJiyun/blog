import { describe, it, expect } from "vitest";
import { computeScrollProgress } from "@/lib/scrollProgress";

describe("computeScrollProgress", () => {
  it("returns 0 before the article starts", () => {
    const progress = computeScrollProgress({
      articleTop: 500,
      articleHeight: 3000,
      scrollY: 100,
      viewportHeight: 800,
    });
    expect(progress).toBe(0);
  });

  it("returns 100 once scrolled past the article's own scrollable range", () => {
    const progress = computeScrollProgress({
      articleTop: 500,
      articleHeight: 3000,
      scrollY: 4000,
      viewportHeight: 800,
    });
    expect(progress).toBe(100);
  });

  it("returns the midpoint percentage partway through the article", () => {
    const progress = computeScrollProgress({
      articleTop: 0,
      articleHeight: 2800,
      scrollY: 1000,
      viewportHeight: 800,
    });
    expect(progress).toBe(50);
  });

  it("returns 100 for an article shorter than the viewport once reached", () => {
    const progress = computeScrollProgress({
      articleTop: 0,
      articleHeight: 400,
      scrollY: 1000,
      viewportHeight: 800,
    });
    expect(progress).toBe(100);
  });
});

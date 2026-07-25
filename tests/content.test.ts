import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slugify";
import { extractFirstImageUrl, computeReadMinutes } from "@/lib/content";

describe("slugify", () => {
  it("slugifies an ascii title", () => {
    expect(slugify("Window Functions 101")).toBe("window-functions-101");
  });

  it("slugifies a Korean title", () => {
    expect(slugify("윈도우 함수 정리")).toBe("윈도우-함수-정리");
  });

  it("strips punctuation", () => {
    expect(slugify("What is p-value?!")).toBe("what-is-p-value");
  });

  it("falls back to a random slug for an empty title", () => {
    const slug = slugify("!!!");
    expect(slug).toMatch(/^[a-z0-9]{8}$/);
  });
});

describe("extractFirstImageUrl", () => {
  it("finds the first image", () => {
    const body = "intro text\n\n![alt text](https://example.com/a.jpg)\n\nmore text";
    expect(extractFirstImageUrl(body)).toBe("https://example.com/a.jpg");
  });

  it("returns null when there is no image", () => {
    expect(extractFirstImageUrl("no images here")).toBeNull();
  });

  it("ignores links without a bang", () => {
    expect(extractFirstImageUrl("[not an image](https://example.com/a.jpg)")).toBeNull();
  });
});

describe("computeReadMinutes", () => {
  it("rounds up", () => {
    const body = "가".repeat(501);
    expect(computeReadMinutes(body)).toBe(2);
  });

  it("has a minimum of one minute", () => {
    expect(computeReadMinutes("짧은 글")).toBe(1);
  });

  it("excludes code blocks", () => {
    const body = "짧은 설명\n\n```python\n" + "x = 1\n".repeat(200) + "```";
    expect(computeReadMinutes(body)).toBe(1);
  });
});

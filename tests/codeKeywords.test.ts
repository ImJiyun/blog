import { describe, it, expect } from "vitest";
import { isHighlightableInlineKeyword } from "@/lib/codeKeywords";

describe("isHighlightableInlineKeyword", () => {
  it("matches exact Python keywords", () => {
    expect(isHighlightableInlineKeyword("if")).toBe(true);
    expect(isHighlightableInlineKeyword("elif")).toBe(true);
    expect(isHighlightableInlineKeyword("else")).toBe(true);
    expect(isHighlightableInlineKeyword("def")).toBe(true);
    expect(isHighlightableInlineKeyword("lambda")).toBe(true);
  });

  it("matches exact SQL keywords, including multi-word ones", () => {
    expect(isHighlightableInlineKeyword("SELECT")).toBe(true);
    expect(isHighlightableInlineKeyword("GROUP BY")).toBe(true);
    expect(isHighlightableInlineKeyword("ORDER BY")).toBe(true);
  });

  it("does not match a function call or arbitrary identifier", () => {
    expect(isHighlightableInlineKeyword("Series.where()")).toBe(false);
    expect(isHighlightableInlineKeyword("np.select()")).toBe(false);
    expect(isHighlightableInlineKeyword("pandas")).toBe(false);
  });

  it("does not match a substring or near-miss of a keyword", () => {
    expect(isHighlightableInlineKeyword("ifconfig")).toBe(false);
    expect(isHighlightableInlineKeyword("my_if")).toBe(false);
    expect(isHighlightableInlineKeyword("selfless")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isHighlightableInlineKeyword("select")).toBe(false);
    expect(isHighlightableInlineKeyword("IF")).toBe(false);
    expect(isHighlightableInlineKeyword("Class")).toBe(false);
  });

  it("does not match empty or whitespace-only text", () => {
    expect(isHighlightableInlineKeyword("")).toBe(false);
    expect(isHighlightableInlineKeyword("   ")).toBe(false);
  });
});

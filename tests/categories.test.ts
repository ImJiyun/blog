import { describe, it, expect } from "vitest";
import {
  DATA_CATEGORIES,
  DEV_CATEGORIES,
  LIFE_CATEGORIES,
  ALL_CATEGORIES,
  categorySection,
  sectionCategories,
} from "@/lib/api";

describe("DATA_CATEGORIES", () => {
  it("has the five existing data categories, unchanged", () => {
    expect(DATA_CATEGORIES).toEqual(["SQL", "Python", "Statistics", "Tableau", "PowerBI"]);
  });
});

describe("DEV_CATEGORIES", () => {
  it("starts empty", () => {
    expect(DEV_CATEGORIES).toEqual([]);
  });
});

describe("ALL_CATEGORIES", () => {
  it("includes data, dev, Projects, and life categories", () => {
    expect(ALL_CATEGORIES).toEqual([
      ...DATA_CATEGORIES,
      ...DEV_CATEGORIES,
      "Projects",
      ...LIFE_CATEGORIES,
    ]);
  });
});

describe("categorySection", () => {
  it("maps a data category to Data", () => {
    expect(categorySection("SQL")).toEqual({ label: "Data", href: "/data" });
  });

  it("maps a life category to Life", () => {
    expect(categorySection("Travel")).toEqual({ label: "Life", href: "/life" });
  });

  it("falls back to Latest for an unrecognized category", () => {
    expect(categorySection("Projects")).toEqual({ label: "Latest", href: "/" });
  });
});

describe("sectionCategories", () => {
  it("returns DATA_CATEGORIES for a data category", () => {
    expect(sectionCategories("Python")).toBe(DATA_CATEGORIES);
  });

  it("returns LIFE_CATEGORIES for a life category", () => {
    expect(sectionCategories("Travel")).toBe(LIFE_CATEGORIES);
  });

  it("falls back to non-data/non-dev/non-life categories for Projects", () => {
    expect(sectionCategories("Projects")).toEqual(
      ALL_CATEGORIES.filter(
        (c) =>
          !(DATA_CATEGORIES as readonly string[]).includes(c) &&
          !(DEV_CATEGORIES as readonly string[]).includes(c) &&
          !(LIFE_CATEGORIES as readonly string[]).includes(c),
      ),
    );
  });
});

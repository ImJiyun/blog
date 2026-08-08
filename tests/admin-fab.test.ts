import { describe, it, expect } from "vitest";
import { isAdminFabPath } from "@/lib/adminFab";

describe("isAdminFabPath", () => {
  it("returns true for the home page", () => {
    expect(isAdminFabPath("/")).toBe(true);
  });

  it("returns true for each public list page", () => {
    expect(isAdminFabPath("/study")).toBe(true);
    expect(isAdminFabPath("/life")).toBe(true);
    expect(isAdminFabPath("/project")).toBe(true);
    expect(isAdminFabPath("/posts")).toBe(true);
  });

  it("returns false for a post detail page", () => {
    expect(isAdminFabPath("/posts/some-slug")).toBe(false);
  });

  it("returns false for admin pages", () => {
    expect(isAdminFabPath("/admin/posts")).toBe(false);
  });

  it("returns false for an unrelated path", () => {
    expect(isAdminFabPath("/random")).toBe(false);
  });

  it("returns false for a trailing-slash variant not in the allow-list", () => {
    expect(isAdminFabPath("/study/")).toBe(false);
  });
});

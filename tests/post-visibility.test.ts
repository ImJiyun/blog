import { describe, it, expect } from "vitest";
import { postVisibilityWhere } from "@/lib/post-visibility";

describe("postVisibilityWhere", () => {
  it("defaults to published, public-only", () => {
    expect(postVisibilityWhere()).toEqual({ status: "published", isPublic: true });
  });

  it("drops the isPublic filter for an admin session", () => {
    expect(postVisibilityWhere({ isAdmin: true })).toEqual({ status: "published" });
  });

  it("uses the given status", () => {
    expect(postVisibilityWhere({ status: "draft", isAdmin: true })).toEqual({
      status: "draft",
    });
  });
});

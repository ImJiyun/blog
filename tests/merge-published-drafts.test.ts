import { describe, it, expect } from "vitest";
import { mergePublishedAndDrafts } from "@/lib/api";
import type { Post } from "@/lib/api";

function makePost(overrides: Partial<Post>): Post {
  return {
    id: "id",
    title: "title",
    slug: "slug",
    bodyMd: "body",
    subtitle: null,
    thumbnailUrl: null,
    readMinutes: 1,
    category: "SQL",
    tags: [],
    status: "published",
    isPublic: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mergePublishedAndDrafts", () => {
  it("merges both lists and sorts by createdAt descending", () => {
    const older = makePost({ id: "1", createdAt: "2026-01-01T00:00:00.000Z" });
    const newer = makePost({
      id: "2",
      createdAt: "2026-03-01T00:00:00.000Z",
      status: "draft",
      publishedAt: null,
    });

    const result = mergePublishedAndDrafts([older], [newer]);

    expect(result.map((p) => p.id)).toEqual(["2", "1"]);
  });

  it("returns only the published posts when there are no drafts", () => {
    const post = makePost({ id: "1" });
    expect(mergePublishedAndDrafts([post], [])).toEqual([post]);
  });
});

import { describe, it, expect } from "vitest";
import { buildPostMetadata } from "@/lib/postMetadata";
import type { Post } from "@/lib/api";

// next's `Metadata["twitter"]` type is a union of discriminated card shapes
// plus a catch-all `TwitterMetadata` member that doesn't guarantee `card`, so
// TS won't let the union be read narrowed without an assertion here — the
// runtime shape is known since buildPostMetadata always sets it.
function twitterCard(metadata: ReturnType<typeof buildPostMetadata>): string | undefined {
  return (metadata.twitter as { card?: string } | undefined)?.card;
}

const SITE_URL = "https://hanul.dev";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    title: "SQL 윈도우 함수 정리",
    slug: "sql-window-functions",
    bodyMd: "이 글은 SQL 윈도우 함수를 정리한 글입니다.",
    subtitle: null,
    thumbnailUrl: null,
    readMinutes: 3,
    category: "SQL",
    tags: [],
    status: "published",
    isPublic: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    publishedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildPostMetadata", () => {
  it("sets the page title to the post title suffixed with the site name", () => {
    const metadata = buildPostMetadata(makePost(), SITE_URL);
    expect(metadata.title).toBe("SQL 윈도우 함수 정리 · hanul.dev");
  });

  it("derives the description from the post body via toExcerpt", () => {
    const metadata = buildPostMetadata(makePost(), SITE_URL);
    expect(metadata.description).toBe("이 글은 SQL 윈도우 함수를 정리한 글입니다.");
  });

  it("sets openGraph.url to the absolute post URL", () => {
    const metadata = buildPostMetadata(makePost(), SITE_URL);
    expect(metadata.openGraph?.url).toBe("https://hanul.dev/posts/sql-window-functions");
  });

  it("includes an og:image and uses the large-image twitter card when a thumbnail exists", () => {
    const metadata = buildPostMetadata(
      makePost({ thumbnailUrl: "https://storage.googleapis.com/bucket/img.png" }),
      SITE_URL,
    );
    expect(metadata.openGraph?.images).toEqual([
      { url: "https://storage.googleapis.com/bucket/img.png" },
    ]);
    expect(twitterCard(metadata)).toBe("summary_large_image");
  });

  it("omits og:image and falls back to the summary twitter card when there is no thumbnail", () => {
    const metadata = buildPostMetadata(makePost({ thumbnailUrl: null }), SITE_URL);
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(twitterCard(metadata)).toBe("summary");
  });
});

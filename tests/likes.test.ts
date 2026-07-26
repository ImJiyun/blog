import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createPost } from "@/app/api/posts/route";
import { POST as toggleLike } from "@/app/api/posts/[id]/likes/route";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";

beforeEach(resetDb);

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function makePost(): Promise<string> {
  const response = await createPost(
    new NextRequest("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "좋아요 테스트",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
      }),
      headers: { "Content-Type": "application/json", Cookie: adminCookieHeader() },
    }),
  );
  return (await response.json()).id;
}

function likeRequest(visitorId?: string) {
  return new NextRequest("http://localhost", {
    method: "POST",
    headers: visitorId ? { Cookie: `visitor_id=${visitorId}` } : {},
  });
}

describe("POST /api/posts/{id}/likes", () => {
  it("issues a visitor_id cookie and likes when none is present", async () => {
    const postId = await makePost();
    const response = await toggleLike(likeRequest(), params(postId));
    expect(await response.json()).toEqual({ liked: true });
    expect(response.cookies.get("visitor_id")?.value).toBeTruthy();
  });

  it("does not re-issue a cookie when one is already present", async () => {
    const postId = await makePost();
    const response = await toggleLike(likeRequest("visitor-1"), params(postId));
    expect(await response.json()).toEqual({ liked: true });
    expect(response.cookies.get("visitor_id")).toBeUndefined();
  });

  it("returns 404 for a missing post", async () => {
    const response = await toggleLike(
      likeRequest("visitor-1"),
      params("00000000-0000-0000-0000-000000000000"),
    );
    expect(response.status).toBe(404);
  });

  it("likes then unlikes on repeated calls from the same visitor", async () => {
    const postId = await makePost();
    const first = await toggleLike(likeRequest("visitor-1"), params(postId));
    expect(await first.json()).toEqual({ liked: true });

    const second = await toggleLike(likeRequest("visitor-1"), params(postId));
    expect(await second.json()).toEqual({ liked: false });
  });

  it("tracks different visitors independently", async () => {
    const postId = await makePost();
    await toggleLike(likeRequest("visitor-1"), params(postId));
    const response = await toggleLike(likeRequest("visitor-2"), params(postId));
    expect(await response.json()).toEqual({ liked: true });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createPost } from "@/app/api/posts/route";
import { GET as listComments, POST as createComment } from "@/app/api/posts/[id]/comments/route";
import { DELETE as deleteComment } from "@/app/api/comments/[id]/route";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";
import { resetRateLimits } from "@/lib/ratelimit";

beforeEach(async () => {
  await resetDb();
  resetRateLimits();
});

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function makePost(): Promise<string> {
  const response = await createPost(
    new NextRequest("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "댓글 테스트 글",
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

function commentRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("comments", () => {
  it("lists no comments for a fresh post", async () => {
    const postId = await makePost();
    const response = await listComments(new NextRequest("http://localhost"), params(postId));
    expect(await response.json()).toEqual([]);
  });

  it("creates an anonymous comment", async () => {
    const postId = await makePost();
    const response = await createComment(
      commentRequest({ authorName: "익명", body: "좋은 글이네요" }),
      params(postId),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.authorName).toBe("익명");
    expect(body.parentCommentId).toBeNull();
  });

  it("returns 404 for a comment on a missing post", async () => {
    const response = await createComment(
      commentRequest({ authorName: "익명", body: "본문" }),
      params("00000000-0000-0000-0000-000000000000"),
    );
    expect(response.status).toBe(404);
  });

  it("threads a reply under its parent", async () => {
    const postId = await makePost();
    const parentResp = await createComment(
      commentRequest({ authorName: "방문자", body: "질문 있어요" }),
      params(postId),
    );
    const parent = await parentResp.json();

    const reply = await createComment(
      commentRequest({ authorName: "관리자", body: "답변입니다", parentCommentId: parent.id }),
      params(postId),
    );
    expect(reply.status).toBe(201);
    expect((await reply.json()).parentCommentId).toBe(parent.id);
  });

  it("rejects a reply to a comment on a different post", async () => {
    const postA = await makePost();
    const postB = await makePost();

    const parentResp = await createComment(
      commentRequest({ authorName: "방문자", body: "댓글" }),
      params(postA),
    );
    const parent = await parentResp.json();

    const response = await createComment(
      commentRequest({ authorName: "방문자", body: "잘못된 답글", parentCommentId: parent.id }),
      params(postB),
    );
    expect(response.status).toBe(422);
  });

  it("rate-limits comment creation per IP", async () => {
    const postId = await makePost();
    for (let i = 0; i < 5; i++) {
      const response = await createComment(
        commentRequest({ authorName: "방문자", body: "댓글" }),
        params(postId),
      );
      expect(response.status).toBe(201);
    }
    const limited = await createComment(
      commentRequest({ authorName: "방문자", body: "너무 많음" }),
      params(postId),
    );
    expect(limited.status).toBe(429);
  });

  it("requires admin to delete a comment", async () => {
    const postId = await makePost();
    const created = await (
      await createComment(commentRequest({ authorName: "방문자", body: "삭제될 댓글" }), params(postId))
    ).json();

    const unauth = await deleteComment(
      new NextRequest("http://localhost", { method: "DELETE" }),
      params(created.id),
    );
    expect(unauth.status).toBe(401);

    const authed = await deleteComment(
      new NextRequest("http://localhost", {
        method: "DELETE",
        headers: { Cookie: adminCookieHeader() },
      }),
      params(created.id),
    );
    expect(authed.status).toBe(204);
  });
});

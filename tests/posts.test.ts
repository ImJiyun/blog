import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/posts/route";
import { GET as GET_ONE, PUT, DELETE } from "@/app/api/posts/[id]/route";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";

beforeEach(resetDb);

function listRequest(query = "") {
  return new NextRequest(`http://localhost/api/posts${query}`);
}

function createRequest(body: Record<string, unknown>, authed = true) {
  return new NextRequest("http://localhost/api/posts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(authed ? { Cookie: adminCookieHeader() } : {}),
    },
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/posts", () => {
  it("returns an empty list", async () => {
    const response = await GET(listRequest());
    expect(await response.json()).toEqual([]);
  });
});

describe("POST /api/posts", () => {
  it("requires admin", async () => {
    const response = await POST(
      createRequest(
        { title: "x", bodyMd: "x", category: "SQL", tags: [], status: "draft" },
        false,
      ),
    );
    expect(response.status).toBe(401);
  });

  it("creates and reads back a post", async () => {
    const create = await POST(
      createRequest({
        title: "윈도우 함수 정리",
        bodyMd: "SELECT ROW_NUMBER() OVER (...);",
        category: "SQL",
        tags: ["sql", "window"],
        status: "published",
      }),
    );
    expect(create.status).toBe(201);
    const body = await create.json();
    expect(body.slug).toBe("윈도우-함수-정리");
    expect(body.readMinutes).toBeGreaterThanOrEqual(1);
    expect(body.thumbnailUrl).toBeNull();
    expect(body.publishedAt).not.toBeNull();

    const getResp = await GET_ONE(new NextRequest("http://localhost"), params(body.slug));
    expect(getResp.status).toBe(200);
    expect((await getResp.json()).title).toBe("윈도우 함수 정리");
  });

  it("extracts the thumbnail from the first image", async () => {
    const create = await POST(
      createRequest({
        title: "사진 있는 글",
        bodyMd: "intro\n\n![파리](https://example.com/paris.jpg)\n\nmore",
        category: "Travel",
        tags: [],
        status: "published",
      }),
    );
    expect((await create.json()).thumbnailUrl).toBe("https://example.com/paris.jpg");
  });

  it("suffixes the slug on a duplicate title", async () => {
    const payload = {
      title: "중복 제목",
      bodyMd: "본문",
      category: "SQL",
      tags: [],
      status: "published",
    };
    const first = await POST(createRequest(payload));
    const second = await POST(createRequest(payload));
    expect((await first.json()).slug).toBe("중복-제목");
    expect((await second.json()).slug).toBe("중복-제목-2");
  });

  it("excludes drafts from the default list", async () => {
    await POST(
      createRequest({
        title: "발행글",
        bodyMd: "x",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );
    await POST(
      createRequest({ title: "초안글", bodyMd: "x", category: "SQL", tags: [], status: "draft" }),
    );

    const response = await GET(listRequest());
    const titles = (await response.json()).map((p: { title: string }) => p.title);
    expect(titles).toEqual(["발행글"]);
  });

  it("ignores ?status=draft from an unauthenticated caller", async () => {
    await POST(
      createRequest({
        title: "발행글",
        bodyMd: "x",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );
    await POST(
      createRequest({ title: "초안글", bodyMd: "x", category: "SQL", tags: [], status: "draft" }),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/posts?status=draft"),
    );
    const titles = (await response.json()).map((p: { title: string }) => p.title);
    expect(titles).toEqual(["발행글"]);
  });

  it("honors ?status=draft for an authenticated admin", async () => {
    await POST(
      createRequest({
        title: "발행글",
        bodyMd: "x",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );
    await POST(
      createRequest({ title: "초안글", bodyMd: "x", category: "SQL", tags: [], status: "draft" }),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/posts?status=draft", {
        headers: { Cookie: adminCookieHeader() },
      }),
    );
    const titles = (await response.json()).map((p: { title: string }) => p.title);
    expect(titles).toEqual(["초안글"]);
  });

  it("filters by category and tag", async () => {
    await POST(
      createRequest({
        title: "SQL 글",
        bodyMd: "x",
        category: "SQL",
        tags: ["join"],
        status: "published",
      }),
    );
    await POST(
      createRequest({
        title: "여행 글",
        bodyMd: "x",
        category: "Travel",
        tags: ["paris"],
        status: "published",
      }),
    );

    const byCategory = await GET(listRequest("?category=Travel"));
    expect((await byCategory.json()).map((p: { title: string }) => p.title)).toEqual([
      "여행 글",
    ]);

    const byTag = await GET(listRequest("?tag=join"));
    expect((await byTag.json()).map((p: { title: string }) => p.title)).toEqual([
      "SQL 글",
    ]);
  });

  it("searches title and body", async () => {
    await POST(
      createRequest({
        title: "회귀분석 p-value",
        bodyMd: "통계 이야기",
        category: "Statistics",
        tags: [],
        status: "published",
      }),
    );
    await POST(
      createRequest({
        title: "무관한 글",
        bodyMd: "다른 내용",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );

    const response = await GET(listRequest("?q=" + encodeURIComponent("회귀분석")));
    expect((await response.json()).map((p: { title: string }) => p.title)).toEqual([
      "회귀분석 p-value",
    ]);
  });

  it("defaults isPublic to true when omitted", async () => {
    const create = await POST(
      createRequest({
        title: "기본값 글",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );
    expect((await create.json()).isPublic).toBe(true);
  });

  it("accepts isPublic: false on create", async () => {
    const create = await POST(
      createRequest({
        title: "비공개 글",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: false,
      }),
    );
    expect((await create.json()).isPublic).toBe(false);
  });

  it("excludes a private post from the list for an unauthenticated caller", async () => {
    await POST(
      createRequest({
        title: "공개글",
        bodyMd: "x",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: true,
      }),
    );
    await POST(
      createRequest({
        title: "비공개글",
        bodyMd: "x",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: false,
      }),
    );

    const response = await GET(listRequest());
    const titles = (await response.json()).map((p: { title: string }) => p.title);
    expect(titles).toEqual(["공개글"]);
  });

  it("includes a private post in the list for an authenticated admin", async () => {
    await POST(
      createRequest({
        title: "비공개글",
        bodyMd: "x",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: false,
      }),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/posts", { headers: { Cookie: adminCookieHeader() } }),
    );
    const titles = (await response.json()).map((p: { title: string }) => p.title);
    expect(titles).toEqual(["비공개글"]);
  });
});

describe("PUT /api/posts/{id}", () => {
  it("updates a post", async () => {
    const create = await POST(
      createRequest({
        title: "원제목",
        bodyMd: "원본",
        category: "SQL",
        tags: [],
        status: "draft",
      }),
    );
    const postId = (await create.json()).id;

    const update = await PUT(
      new NextRequest("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          title: "원제목",
          bodyMd: "수정된 본문",
          category: "SQL",
          tags: ["updated"],
          status: "published",
        }),
        headers: { "Content-Type": "application/json", Cookie: adminCookieHeader() },
      }),
      params(postId),
    );
    expect(update.status).toBe(200);
    const body = await update.json();
    expect(body.bodyMd).toBe("수정된 본문");
    expect(body.publishedAt).not.toBeNull();
  });

  it("requires admin", async () => {
    const create = await POST(
      createRequest({ title: "제목", bodyMd: "본문", category: "SQL", tags: [], status: "draft" }),
    );
    const postId = (await create.json()).id;

    const response = await PUT(
      new NextRequest("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          title: "제목",
          bodyMd: "다른 본문",
          category: "SQL",
          tags: [],
          status: "draft",
        }),
        headers: { "Content-Type": "application/json" },
      }),
      params(postId),
    );
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/posts/{id}", () => {
  it("deletes a post", async () => {
    const create = await POST(
      createRequest({
        title: "삭제될 글",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "draft",
      }),
    );
    const created = await create.json();

    const del = await DELETE(
      new NextRequest("http://localhost", {
        method: "DELETE",
        headers: { Cookie: adminCookieHeader() },
      }),
      params(created.id),
    );
    expect(del.status).toBe(204);

    const getResp = await GET_ONE(new NextRequest("http://localhost"), params(created.slug));
    expect(getResp.status).toBe(404);
  });
});

describe("GET /api/posts/{slug}", () => {
  it("returns 404 for a nonexistent slug", async () => {
    const response = await GET_ONE(new NextRequest("http://localhost"), params("does-not-exist"));
    expect(response.status).toBe(404);
  });

  it("returns 404 for a draft slug when unauthenticated", async () => {
    const create = await POST(
      createRequest({ title: "초안", bodyMd: "본문", category: "SQL", tags: [], status: "draft" }),
    );
    const slug = (await create.json()).slug;
    const response = await GET_ONE(new NextRequest("http://localhost"), params(slug));
    expect(response.status).toBe(404);
  });

  it("returns a draft slug when authenticated as admin", async () => {
    const create = await POST(
      createRequest({ title: "초안", bodyMd: "본문", category: "SQL", tags: [], status: "draft" }),
    );
    const slug = (await create.json()).slug;
    const response = await GET_ONE(
      new NextRequest("http://localhost", { headers: { Cookie: adminCookieHeader() } }),
      params(slug),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe("draft");
  });
});

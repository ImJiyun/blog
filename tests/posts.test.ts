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

  it("persists an optional subtitle", async () => {
    const create = await POST(
      createRequest({
        title: "부제 있는 글",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
        subtitle: "짧은 한 줄 설명",
      }),
    );
    expect((await create.json()).subtitle).toBe("짧은 한 줄 설명");
  });

  it("defaults subtitle to null when omitted", async () => {
    const create = await POST(
      createRequest({
        title: "부제 없는 글",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );
    expect((await create.json()).subtitle).toBeNull();
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

  it("updates isPublic when provided", async () => {
    const create = await POST(
      createRequest({
        title: "원제목",
        bodyMd: "원본",
        category: "SQL",
        tags: [],
        status: "published",
      }),
    );
    const postId = (await create.json()).id;

    const update = await PUT(
      new NextRequest("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          title: "원제목",
          bodyMd: "원본",
          category: "SQL",
          tags: [],
          status: "published",
          isPublic: false,
        }),
        headers: { "Content-Type": "application/json", Cookie: adminCookieHeader() },
      }),
      params(postId),
    );
    expect((await update.json()).isPublic).toBe(false);
  });

  it("preserves isPublic when omitted from the update body", async () => {
    const create = await POST(
      createRequest({
        title: "원제목",
        bodyMd: "원본",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: false,
      }),
    );
    const postId = (await create.json()).id;

    const update = await PUT(
      new NextRequest("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          title: "수정된 제목",
          bodyMd: "원본",
          category: "SQL",
          tags: [],
          status: "published",
        }),
        headers: { "Content-Type": "application/json", Cookie: adminCookieHeader() },
      }),
      params(postId),
    );
    expect((await update.json()).isPublic).toBe(false);
  });

  it("updates the subtitle", async () => {
    const create = await POST(
      createRequest({
        title: "원제목",
        bodyMd: "원본",
        category: "SQL",
        tags: [],
        status: "draft",
        subtitle: "원래 부제",
      }),
    );
    const postId = (await create.json()).id;

    const update = await PUT(
      new NextRequest("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          title: "원제목",
          bodyMd: "원본",
          category: "SQL",
          tags: [],
          status: "draft",
          subtitle: "수정된 부제",
        }),
        headers: { "Content-Type": "application/json", Cookie: adminCookieHeader() },
      }),
      params(postId),
    );
    expect((await update.json()).subtitle).toBe("수정된 부제");
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

  it("returns 404 for a private published slug when unauthenticated", async () => {
    const create = await POST(
      createRequest({
        title: "비공개",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: false,
      }),
    );
    const slug = (await create.json()).slug;
    const response = await GET_ONE(new NextRequest("http://localhost"), params(slug));
    expect(response.status).toBe(404);
  });

  it("returns a private published slug when authenticated as admin", async () => {
    const create = await POST(
      createRequest({
        title: "비공개",
        bodyMd: "본문",
        category: "SQL",
        tags: [],
        status: "published",
        isPublic: false,
      }),
    );
    const slug = (await create.json()).slug;
    const response = await GET_ONE(
      new NextRequest("http://localhost", { headers: { Cookie: adminCookieHeader() } }),
      params(slug),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).isPublic).toBe(false);
  });
});

describe("GET /api/posts/{slug} — prev/next", () => {
  async function publish(title: string, category: string, extra: Record<string, unknown> = {}) {
    const create = await POST(
      createRequest({ title, bodyMd: "본문", category, tags: [], status: "published", ...extra }),
    );
    return create.json();
  }

  it("finds prev/next within the same section, ordered by publishedAt", async () => {
    // resetDb() truncates between tests, but not between these three creates —
    // publishedAt is set at creation time (server clock), so create oldest first.
    const older = await publish("옛날 SQL 글", "SQL");
    const middle = await publish("가운데 Python 글", "Python");
    const newer = await publish("최신 Statistics 글", "Statistics");

    const response = await GET_ONE(new NextRequest("http://localhost"), params(middle.slug));
    const body = await response.json();
    expect(body.prevPost).toEqual({ slug: newer.slug, title: newer.title });
    expect(body.nextPost).toEqual({ slug: older.slug, title: older.title });
  });

  it("returns null prevPost (with a non-null nextPost) when queried on the newest post in a multi-item section", async () => {
    // Distinct from the "only post in its section" case below: here the section has
    // 3 posts, so this exercises the idx > 0 guard actually evaluating false at idx 0,
    // rather than collapsing with the idx < length - 1 guard on a single-item list.
    await publish("옛날 SQL 글", "SQL");
    const middle = await publish("가운데 Python 글", "Python");
    const newest = await publish("최신 Statistics 글", "Statistics");

    const response = await GET_ONE(new NextRequest("http://localhost"), params(newest.slug));
    const body = await response.json();
    expect(body.prevPost).toBeNull();
    expect(body.nextPost).toEqual({ slug: middle.slug, title: middle.title });
  });

  it("does not cross section boundaries", async () => {
    const study = await publish("공부 글", "SQL");
    await publish("여행 글", "Travel");

    const response = await GET_ONE(new NextRequest("http://localhost"), params(study.slug));
    const body = await response.json();
    expect(body.prevPost).toBeNull();
    expect(body.nextPost).toBeNull();
  });

  it("returns null on both sides for the only post in its section", async () => {
    const only = await publish("혼자인 글", "SQL");
    const response = await GET_ONE(new NextRequest("http://localhost"), params(only.slug));
    const body = await response.json();
    expect(body.prevPost).toBeNull();
    expect(body.nextPost).toBeNull();
  });

  it("excludes private posts from being a neighbor, even for an admin viewer", async () => {
    const pub1 = await publish("공개 글 1", "SQL");
    await publish("비공개 글", "Python", { isPublic: false });
    const pub2 = await publish("공개 글 2", "Statistics");

    const response = await GET_ONE(
      new NextRequest("http://localhost", { headers: { Cookie: adminCookieHeader() } }),
      params(pub1.slug),
    );
    const body = await response.json();
    expect(body.prevPost).toEqual({ slug: pub2.slug, title: pub2.title });
  });

  it("excludes drafts from being a neighbor", async () => {
    const pub = await publish("발행 글", "SQL");
    await POST(
      createRequest({ title: "초안 글", bodyMd: "x", category: "Python", tags: [], status: "draft" }),
    );

    const response = await GET_ONE(new NextRequest("http://localhost"), params(pub.slug));
    expect((await response.json()).prevPost).toBeNull();
  });
});

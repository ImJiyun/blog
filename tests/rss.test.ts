import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/posts/route";
import { GET } from "@/app/rss.xml/route";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";
import { prisma } from "@/lib/prisma";

beforeEach(resetDb);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/posts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader(),
    },
  });
}

async function createPost(body: Record<string, unknown>) {
  const response = await POST(createRequest(body));
  return response.json();
}

describe("GET /rss.xml", () => {
  it("includes a published, public post with escaped title/description and correct link/guid", async () => {
    const created = await createPost({
      title: 'SQL & "윈도우" <함수> 정리',
      bodyMd: "본문 내용입니다.",
      category: "SQL",
      tags: [],
      status: "published",
    });

    const response = await GET();
    const xml = await response.text();

    const url = `${BASE_URL}/posts/${created.slug}`;
    expect(xml).toContain(`<link>${url}</link>`);
    expect(xml).toContain(`<guid isPermaLink="true">${url}</guid>`);
    expect(xml).toContain(
      "<title>SQL &amp; &quot;윈도우&quot; &lt;함수&gt; 정리</title>",
    );
    expect(xml).toContain("<description>본문 내용입니다.</description>");
    expect(xml).toMatch(/<pubDate>[^<]+<\/pubDate>/);
  });

  it("excludes a draft post", async () => {
    const created = await createPost({
      title: "초안 글",
      bodyMd: "초안 본문",
      category: "SQL",
      tags: [],
      status: "draft",
    });

    const response = await GET();
    const xml = await response.text();

    expect(xml).not.toContain(`/posts/${created.slug}`);
    expect(xml).not.toContain("초안 글");
  });

  it("excludes a private published post", async () => {
    const created = await createPost({
      title: "비공개 글",
      bodyMd: "비공개 본문",
      category: "SQL",
      tags: [],
      status: "published",
      isPublic: false,
    });

    const response = await GET();
    const xml = await response.text();

    expect(xml).not.toContain(`/posts/${created.slug}`);
    expect(xml).not.toContain("비공개 글");
  });

  it("uses an excerpt for <description>, not the full body", async () => {
    const longBody = "가".repeat(250);
    await createPost({
      title: "긴 본문 글",
      bodyMd: longBody,
      category: "SQL",
      tags: [],
      status: "published",
    });

    const response = await GET();
    const xml = await response.text();

    expect(xml).not.toContain(longBody);
    expect(xml).toContain("…");
  });

  it("responds with the correct Content-Type header", async () => {
    const response = await GET();
    expect(response.headers.get("Content-Type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
  });

  it("caps items at 20 even when more published public posts exist", async () => {
    const category = await prisma.category.findFirstOrThrow({ where: { name: "SQL" } });
    const now = Date.now();
    await prisma.post.createMany({
      data: Array.from({ length: 25 }, (_, i) => ({
        title: `순위 글 ${i}`,
        slug: `rank-post-${i}`,
        bodyMd: "본문",
        categoryId: category.id,
        tags: [],
        status: "published",
        publishedAt: new Date(now - i * 1000),
      })),
    });

    const response = await GET();
    const xml = await response.text();

    expect(xml.match(/<item>/g)?.length).toBe(20);
    expect(xml).toContain("순위 글 0");
    expect(xml).not.toContain("순위 글 24");
  });
});

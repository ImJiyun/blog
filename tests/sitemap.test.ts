import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/posts/route";
import sitemap from "@/app/sitemap";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";

beforeEach(resetDb);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = ["/", "/data", "/dev", "/life", "/posts"];

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

describe("sitemap", () => {
  it("includes a published, public post's URL", async () => {
    const created = await createPost({
      title: "공개 발행 글",
      bodyMd: "본문 내용입니다.",
      category: "SQL",
      tags: [],
      status: "published",
    });

    const entries = await sitemap();
    const url = `${BASE_URL}/posts/${created.slug}`;

    expect(entries.some((entry) => entry.url === url)).toBe(true);
  });

  it("excludes a draft post", async () => {
    const created = await createPost({
      title: "초안 글",
      bodyMd: "초안 본문",
      category: "SQL",
      tags: [],
      status: "draft",
    });

    const entries = await sitemap();

    expect(
      entries.some((entry) => entry.url.endsWith(`/posts/${created.slug}`)),
    ).toBe(false);
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

    const entries = await sitemap();

    expect(
      entries.some((entry) => entry.url.endsWith(`/posts/${created.slug}`)),
    ).toBe(false);
  });

  it("still returns the static routes when there are zero posts", async () => {
    const entries = await sitemap();

    for (const path of STATIC_ROUTES) {
      expect(entries.some((entry) => entry.url === `${BASE_URL}${path}`)).toBe(
        true,
      );
    }
  });
});

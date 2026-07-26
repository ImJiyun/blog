import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/tags/route";
import { POST as createPost } from "@/app/api/posts/route";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";

beforeEach(resetDb);

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/posts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader() },
  });
}

function tagsRequest(qs = "") {
  return new NextRequest(`http://localhost/api/tags${qs}`);
}

describe("GET /api/tags", () => {
  it("returns an empty list", async () => {
    const response = await GET(tagsRequest());
    expect(await response.json()).toEqual([]);
  });

  it("counts tags across published posts only", async () => {
    await createPost(
      createRequest({ title: "글1", bodyMd: "x", category: "SQL", tags: ["sql", "join"], status: "published" }),
    );
    await createPost(
      createRequest({ title: "글2", bodyMd: "x", category: "SQL", tags: ["sql"], status: "published" }),
    );
    await createPost(
      createRequest({ title: "초안", bodyMd: "x", category: "SQL", tags: ["sql"], status: "draft" }),
    );

    const response = await GET(tagsRequest());
    const counts = Object.fromEntries(
      (await response.json()).map((row: { tag: string; count: number }) => [row.tag, row.count]),
    );
    expect(counts).toEqual({ sql: 2, join: 1 });
  });

  it("scopes tags to the given categories", async () => {
    await createPost(
      createRequest({ title: "SQL글", bodyMd: "x", category: "SQL", tags: ["sql"], status: "published" }),
    );
    await createPost(
      createRequest({ title: "여행글", bodyMd: "x", category: "Travel", tags: ["travel"], status: "published" }),
    );

    const response = await GET(tagsRequest("?categories=SQL,Python,Statistics,Tableau,PowerBI"));
    const counts = Object.fromEntries(
      (await response.json()).map((row: { tag: string; count: number }) => [row.tag, row.count]),
    );
    expect(counts).toEqual({ sql: 1 });
  });

  it("falls back to unscoped when categories is malformed (empty after parsing)", async () => {
    await createPost(
      createRequest({ title: "SQL글", bodyMd: "x", category: "SQL", tags: ["sql"], status: "published" }),
    );
    await createPost(
      createRequest({ title: "여행글", bodyMd: "x", category: "Travel", tags: ["travel"], status: "published" }),
    );

    const response = await GET(tagsRequest("?categories=,,"));
    const counts = Object.fromEntries(
      (await response.json()).map((row: { tag: string; count: number }) => [row.tag, row.count]),
    );
    expect(counts).toEqual({ sql: 1, travel: 1 });
  });
});

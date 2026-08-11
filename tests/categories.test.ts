import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET as listCategories, POST as createCategory } from "@/app/api/categories/route";
import {
  PATCH as updateCategory,
  DELETE as deleteCategory,
} from "@/app/api/categories/[id]/route";
import { POST as createPost } from "@/app/api/posts/route";
import { resetDb } from "./helpers/db";
import { adminCookieHeader } from "./helpers/auth";

beforeEach(resetDb);

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

function postRequest(body: unknown, admin = true) {
  return new NextRequest("http://localhost/api/categories", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(admin ? { Cookie: adminCookieHeader() } : {}),
    },
  });
}

function patchRequest(id: string, body: unknown, admin = true) {
  return new NextRequest(`http://localhost/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(admin ? { Cookie: adminCookieHeader() } : {}),
    },
  });
}

function deleteRequest(id: string, reassignTo?: string, admin = true) {
  const qs = reassignTo ? `?reassignTo=${reassignTo}` : "";
  return new NextRequest(`http://localhost/api/categories/${id}${qs}`, {
    method: "DELETE",
    headers: admin ? { Cookie: adminCookieHeader() } : {},
  });
}

async function categoryIdByName(name: string): Promise<string> {
  const body = await (await listCategories()).json();
  return body.find((c: { name: string }) => c.name === name).id;
}

async function makeSqlPost(): Promise<string> {
  const response = await createPost(
    new NextRequest("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "글",
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

describe("GET /api/categories", () => {
  it("lists the seeded categories ordered by sortOrder, with post counts", async () => {
    const body = await (await listCategories()).json();
    expect(body.map((c: { name: string }) => c.name)).toEqual([
      "SQL",
      "Python",
      "Statistics",
      "Tableau",
      "PowerBI",
      "Projects",
      "Travel",
      "Career",
    ]);
    expect(body[0]).toMatchObject({ name: "SQL", section: "data", sortOrder: 0, postCount: 0 });
    expect(body[5]).toMatchObject({ name: "Projects", section: null });
  });

  it("reflects a post's category in postCount", async () => {
    await makeSqlPost();
    const body = await (await listCategories()).json();
    expect(body.find((c: { name: string }) => c.name === "SQL").postCount).toBe(1);
  });
});

describe("POST /api/categories", () => {
  it("rejects a non-admin request with 401", async () => {
    const response = await createCategory(postRequest({ name: "Rust", section: "dev" }, false));
    expect(response.status).toBe(401);
  });

  it("creates a category with a section", async () => {
    const response = await createCategory(postRequest({ name: "Rust", section: "dev" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ name: "Rust", section: "dev", sortOrder: 8 });
  });

  it("creates a category with no section", async () => {
    const response = await createCategory(postRequest({ name: "Misc", section: null }));
    expect(response.status).toBe(201);
    expect((await response.json()).section).toBeNull();
  });

  it("rejects a duplicate name with 409", async () => {
    const response = await createCategory(postRequest({ name: "SQL", section: "data" }));
    expect(response.status).toBe(409);
  });

  it("rejects an empty/whitespace name with 400", async () => {
    const response = await createCategory(postRequest({ name: "   ", section: "data" }));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid section with 400", async () => {
    const response = await createCategory(postRequest({ name: "Rust", section: "backend" }));
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/categories/[id]", () => {
  it("rejects a non-admin request with 401", async () => {
    const id = await categoryIdByName("SQL");
    const response = await updateCategory(patchRequest(id, { name: "SQL2" }, false), params(id));
    expect(response.status).toBe(401);
  });

  it("renames a category", async () => {
    const id = await categoryIdByName("SQL");
    const response = await updateCategory(patchRequest(id, { name: "SQL & Databases" }), params(id));
    expect(response.status).toBe(200);
    expect((await response.json()).name).toBe("SQL & Databases");
  });

  it("moves a category to a different section", async () => {
    const id = await categoryIdByName("SQL");
    const response = await updateCategory(patchRequest(id, { section: "dev" }), params(id));
    expect((await response.json()).section).toBe("dev");
  });

  it("rejects renaming to an existing name with 409", async () => {
    const id = await categoryIdByName("SQL");
    const response = await updateCategory(patchRequest(id, { name: "Python" }), params(id));
    expect(response.status).toBe(409);
  });

  it("returns 404 for a nonexistent category", async () => {
    const response = await updateCategory(
      patchRequest("00000000-0000-0000-0000-000000000000", { name: "X" }),
      params("00000000-0000-0000-0000-000000000000"),
    );
    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/categories/[id]", () => {
  it("rejects a non-admin request with 401", async () => {
    const id = await categoryIdByName("Career");
    const response = await deleteCategory(deleteRequest(id, undefined, false), params(id));
    expect(response.status).toBe(401);
  });

  it("deletes a category with no posts directly, no reassignTo needed", async () => {
    const id = await categoryIdByName("Career");
    const response = await deleteCategory(deleteRequest(id), params(id));
    expect(response.status).toBe(204);
  });

  it("requires reassignTo when the category has posts", async () => {
    await makeSqlPost();
    const id = await categoryIdByName("SQL");
    const response = await deleteCategory(deleteRequest(id), params(id));
    expect(response.status).toBe(400);
  });

  it("reassigns posts to reassignTo and deletes the category", async () => {
    const postId = await makeSqlPost();
    const sqlId = await categoryIdByName("SQL");
    const pythonId = await categoryIdByName("Python");
    const response = await deleteCategory(deleteRequest(sqlId, pythonId), params(sqlId));
    expect(response.status).toBe(204);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    expect(post?.categoryId).toBe(pythonId);
  });

  it("rejects reassignTo pointing at itself with 400", async () => {
    await makeSqlPost();
    const sqlId = await categoryIdByName("SQL");
    const response = await deleteCategory(deleteRequest(sqlId, sqlId), params(sqlId));
    expect(response.status).toBe(400);
  });

  it("refuses to delete the last remaining category", async () => {
    const all = await (await listCategories()).json();
    for (const c of all.slice(1)) {
      await deleteCategory(deleteRequest(c.id), params(c.id));
    }
    const remaining = await (await listCategories()).json();
    expect(remaining).toHaveLength(1);
    const response = await deleteCategory(deleteRequest(remaining[0].id), params(remaining[0].id));
    expect(response.status).toBe(400);
  });
});

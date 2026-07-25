import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb } from "./helpers/db";

describe("prisma client", () => {
  beforeEach(resetDb);

  it("can create and read a post", async () => {
    const post = await prisma.post.create({
      data: { title: "test", slug: "test", bodyMd: "body", category: "SQL", tags: [] },
    });
    const found = await prisma.post.findUnique({ where: { id: post.id } });
    expect(found?.slug).toBe("test");
  });
});

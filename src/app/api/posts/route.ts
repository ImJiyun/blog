import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { extractFirstImageUrl, computeReadMinutes } from "@/lib/content";

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category") ?? undefined;
  const tag = params.get("tag") ?? undefined;
  const q = params.get("q") ?? undefined;
  const requestedStatus = params.get("status") ?? "published";
  const status =
    requestedStatus === "published" || isAdmin(request) ? requestedStatus : "published";

  const posts = await prisma.post.findMany({
    where: {
      status,
      ...(category ? { category } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { bodyMd: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const slug = await uniqueSlug(body.title);
  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug,
      bodyMd: body.bodyMd,
      category: body.category,
      tags: body.tags ?? [],
      status: body.status ?? "draft",
      thumbnailUrl: extractFirstImageUrl(body.bodyMd),
      readMinutes: computeReadMinutes(body.bodyMd),
      publishedAt: body.status === "published" ? new Date() : null,
    },
  });
  return NextResponse.json(post, { status: 201 });
}

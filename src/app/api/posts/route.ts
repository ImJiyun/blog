import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { extractFirstImageUrl, computeReadMinutes } from "@/lib/content";
import { serializePost } from "@/lib/posts";

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
  const admin = isAdmin(request);
  const status = requestedStatus === "published" || admin ? requestedStatus : "published";

  const posts = await prisma.post.findMany({
    where: {
      status,
      ...(admin ? {} : { isPublic: true }),
      ...(category ? { category: { name: category } } : {}),
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
    include: { category: true },
  });
  return NextResponse.json(posts.map(serializePost));
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const slug = await uniqueSlug(body.title);
  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug,
        bodyMd: body.bodyMd,
        category: { connect: { name: body.category } },
        tags: body.tags ?? [],
        subtitle: body.subtitle ?? null,
        status: body.status ?? "draft",
        isPublic: body.isPublic ?? true,
        thumbnailUrl: extractFirstImageUrl(body.bodyMd),
        readMinutes: computeReadMinutes(body.bodyMd),
        publishedAt: body.status === "published" ? new Date() : null,
      },
      include: { category: true },
    });
    return NextResponse.json(serializePost(post), { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
    throw err;
  }
}

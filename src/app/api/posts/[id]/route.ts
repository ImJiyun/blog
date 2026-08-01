import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { extractFirstImageUrl, computeReadMinutes } from "@/lib/content";
import { sectionCategories } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id: slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if ((post.status !== "published" || !post.isPublic) && !isAdmin(request)) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const neighbors = await prisma.post.findMany({
    where: {
      category: { in: [...sectionCategories(post.category)] },
      status: "published",
      isPublic: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, title: true, category: true, tags: true, publishedAt: true },
  });
  const idx = neighbors.findIndex((n) => n.id === post.id);
  const prevPost = idx > 0 ? { slug: neighbors[idx - 1].slug, title: neighbors[idx - 1].title } : null;
  const nextPost =
    idx >= 0 && idx < neighbors.length - 1
      ? { slug: neighbors[idx + 1].slug, title: neighbors[idx + 1].title }
      : null;

  const relatedPosts = neighbors
    .filter((n) => n.id !== post.id)
    .map((n) => ({
      neighbor: n,
      score:
        (n.category === post.category ? 2 : 0) +
        new Set(n.tags.filter((tag) => post.tags.includes(tag))).size,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.neighbor.publishedAt?.getTime() ?? 0) - (a.neighbor.publishedAt?.getTime() ?? 0);
    })
    .slice(0, 3)
    .map(({ neighbor }) => ({
      slug: neighbor.slug,
      title: neighbor.title,
      publishedAt: neighbor.publishedAt,
    }));

  const visitorId = request.cookies.get("visitor_id")?.value;
  const [likeCount, likedByVisitor] = await Promise.all([
    prisma.like.count({ where: { postId: post.id } }),
    visitorId
      ? prisma.like.findUnique({ where: { postId_visitorId: { postId: post.id, visitorId } } })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    ...post,
    prevPost,
    nextPost,
    relatedPosts,
    likeCount,
    liked: !!likedByVisitor,
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  const body = await request.json();
  const wasPublished = existing.status === "published";
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: body.title,
      bodyMd: body.bodyMd,
      category: body.category,
      tags: body.tags ?? [],
      subtitle: body.subtitle ?? null,
      status: body.status,
      isPublic: body.isPublic ?? existing.isPublic,
      thumbnailUrl: extractFirstImageUrl(body.bodyMd),
      readMinutes: computeReadMinutes(body.bodyMd),
      publishedAt:
        body.status === "published" && !wasPublished ? new Date() : existing.publishedAt,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  await prisma.post.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

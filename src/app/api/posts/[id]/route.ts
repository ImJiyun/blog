import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { extractFirstImageUrl, computeReadMinutes } from "@/lib/content";

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
  return NextResponse.json(post);
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

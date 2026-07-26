import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Cloud Run's Google Front End appends the real client IP to the end of any
  // existing X-Forwarded-For header, so the last entry is the trusted one — the
  // first entry is whatever the caller supplied and is fully spoofable on a
  // direct API call.
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",").pop()?.trim() || "unknown";
  if (!checkRateLimit(`comment:${ip}`, 5, 60)) {
    return NextResponse.json(
      { error: "Too many comments, try again later" },
      { status: 429 },
    );
  }

  const body = await request.json();
  if (body.parentCommentId) {
    const parent = await prisma.comment.findUnique({ where: { id: body.parentCommentId } });
    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "Invalid parentCommentId" }, { status: 422 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      parentCommentId: body.parentCommentId ?? null,
      authorName: body.authorName,
      body: body.body,
    },
  });
  return NextResponse.json(comment, { status: 201 });
}

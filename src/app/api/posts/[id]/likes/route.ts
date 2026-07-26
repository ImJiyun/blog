import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Cloud Run's Google Front End appends the real client IP to the end of any
  // existing X-Forwarded-For header, so the last entry is the trusted one — see
  // the same fix in posts/[id]/comments/route.ts.
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",").pop()?.trim() || "unknown";
  if (!checkRateLimit(`like:${ip}`, 10, 60)) {
    return NextResponse.json(
      { error: "Too many like requests, try again later" },
      { status: 429 },
    );
  }

  const existingVisitorId = request.cookies.get("visitor_id")?.value;
  const visitorId = existingVisitorId ?? crypto.randomUUID();

  const existing = await prisma.like.findUnique({
    where: { postId_visitorId: { postId, visitorId } },
  });

  let liked: boolean;
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.like.create({ data: { postId, visitorId } });
    liked = true;
  }

  const response = NextResponse.json({ liked });
  if (!existingVisitorId) {
    response.cookies.set("visitor_id", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}

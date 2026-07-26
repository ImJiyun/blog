import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  await prisma.comment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

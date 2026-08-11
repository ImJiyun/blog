import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { isValidSection } from "@/lib/categoryValidation";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      section: c.section,
      sortOrder: c.sortOrder,
      postCount: c._count.posts,
    })),
  );
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const section = body.section ?? null;
  if (!isValidSection(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }
  const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const category = await prisma.category.create({
    data: { name, section, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
  return NextResponse.json(
    { id: category.id, name: category.name, section: category.section, sortOrder: category.sortOrder, postCount: 0 },
    { status: 201 },
  );
}

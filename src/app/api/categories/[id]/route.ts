import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { isValidSection } from "@/lib/categoryValidation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  const body = await request.json();
  const data: { name?: string; section?: string | null } = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const duplicate = await prisma.category.findUnique({ where: { name } });
    if (duplicate && duplicate.id !== id) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    data.name = name;
  }

  if (body.section !== undefined) {
    if (!isValidSection(body.section)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }
    data.section = body.section;
  }

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json({
    id: category.id,
    name: category.name,
    section: category.section,
    sortOrder: category.sortOrder,
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const totalCategories = await prisma.category.count();
  if (totalCategories <= 1) {
    return NextResponse.json({ error: "Cannot delete the last remaining category" }, { status: 400 });
  }

  const postCount = await prisma.post.count({ where: { categoryId: id } });
  const reassignTo = request.nextUrl.searchParams.get("reassignTo");

  if (postCount > 0) {
    if (!reassignTo) {
      return NextResponse.json({ error: "reassignTo is required" }, { status: 400 });
    }
    if (reassignTo === id) {
      return NextResponse.json({ error: "Cannot reassign to the category being deleted" }, { status: 400 });
    }
    const target = await prisma.category.findUnique({ where: { id: reassignTo } });
    if (!target) {
      return NextResponse.json({ error: "reassignTo category not found" }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.post.updateMany({ where: { categoryId: id }, data: { categoryId: reassignTo } }),
      prisma.category.delete({ where: { id } }),
    ]);
  } else {
    await prisma.category.delete({ where: { id } });
  }

  return new NextResponse(null, { status: 204 });
}

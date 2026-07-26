import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const categoriesParam = request.nextUrl.searchParams.get("categories");
  const parsedCategories = categoriesParam
    ? categoriesParam.split(",").filter((c) => c.length > 0)
    : [];
  const categories = parsedCategories.length > 0 ? parsedCategories : undefined;

  const posts = await prisma.post.findMany({
    where: {
      status: "published",
      ...(categories ? { category: { in: categories } } : {}),
    },
    select: { tags: true },
  });
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const result = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
  return NextResponse.json(result);
}

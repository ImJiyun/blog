import type { Post as PrismaPost, Category } from "@prisma/client";

type PostWithCategory = PrismaPost & { category: Category };

export function serializePost(post: PostWithCategory) {
  const { categoryId, category, ...rest } = post;
  return { ...rest, category: category.name };
}

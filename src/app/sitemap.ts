import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { postVisibilityWhere } from "@/lib/post-visibility";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = ["/", "/data", "/dev", "/life", "/posts"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: postVisibilityWhere(),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, publishedAt: true, updatedAt: true },
  });

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticEntries, ...postEntries];
}

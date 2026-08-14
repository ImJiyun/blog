import type { Metadata } from "next";
import type { Post } from "@/lib/api";
import { toExcerpt } from "@/lib/excerpt";

export function buildPostMetadata(post: Post, siteUrl: string): Metadata {
  const title = `${post.title} · hanul.dev`;
  const description = toExcerpt(post.bodyMd);
  const url = `${siteUrl}/posts/${post.slug}`;
  const images = post.thumbnailUrl ? [{ url: post.thumbnailUrl }] : undefined;

  return {
    title,
    description,
    openGraph: { title, description, url, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description },
  };
}

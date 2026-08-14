import { prisma } from "@/lib/prisma";
import { serializePost } from "@/lib/posts";
import { toExcerpt } from "@/lib/excerpt";
import { postVisibilityWhere } from "@/lib/post-visibility";

// Route has no Dynamic API usage (no `request` param, no cookies()/headers()),
// so without this Next.js would try to statically render it at `next build`
// time — and this repo's Cloud Build docker-build stage doesn't wire in
// DATABASE_URL (only the later `prisma migrate deploy` step and the Cloud Run
// runtime get it), so a static build attempt would fail. See sitemap.ts for
// the same fix applied to the sibling syndication route.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_TITLE = "hanul.dev";
const SITE_DESCRIPTION = "데이터와 일상을 기록하는 hanul.dev 입니다.";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: postVisibilityWhere(),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { category: true },
  });
  const serialized = posts.map(serializePost);

  const items = serialized
    .map((post) => {
      const url = `${BASE_URL}/posts/${post.slug}`;
      const pubDate = new Date(post.publishedAt ?? post.createdAt).toUTCString();
      const description = toExcerpt(post.bodyMd);
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

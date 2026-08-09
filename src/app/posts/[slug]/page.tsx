import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getComments, categorySection, getPostStatusBadgeLabel } from "@/lib/api";
import { isAdminFromCookies } from "@/lib/auth";
import { extractHeadings } from "@/lib/toc";
import MarkdownBody from "@/components/MarkdownBody";
import TableOfContents from "@/components/TableOfContents";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import PostEngagementTracker from "@/components/PostEngagementTracker";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import PostAuthorCard from "@/components/PostAuthorCard";
import RelatedPosts from "@/components/RelatedPosts";
import PostPrevNextNav from "@/components/PostPrevNextNav";
import PostTagLinks from "@/components/PostTagLinks";
import PostDetailAdminActions from "@/components/PostDetailAdminActions";
import styles from "./page.module.css";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  // GET /api/posts/{slug} already 404s a draft unless the request carries a
  // valid admin cookie (serverFetch forwards it automatically, see @/lib/api),
  // so `post` is null here for any draft a non-admin visitor guesses the slug
  // of — no separate status check needed on this page.
  if (!post) {
    notFound();
  }

  const isAdmin = await isAdminFromCookies();
  const statusLabel = getPostStatusBadgeLabel(post);

  const [comments, headings] = await Promise.all([
    getComments(post.id),
    Promise.resolve(extractHeadings(post.bodyMd)),
  ]);

  return (
    <>
      <ScrollProgressBar articleId="article-body" />
      <PostEngagementTracker postSlug={post.slug} />
      <main className={styles.page}>
        <div className={styles.head}>
          {isAdmin && (
            <PostDetailAdminActions postId={post.id} slug={post.slug} />
          )}
          {statusLabel && (
            <span className={styles.statusBadge} data-testid="post-status-badge">
              {statusLabel}
            </span>
          )}
          <p className={styles.breadcrumb}>
            <Link href={categorySection(post.category).href}>
              {categorySection(post.category).label}
            </Link>{" "}
            / {post.category}
          </p>

          {post.thumbnailUrl && (
            <div className={styles.hero}>
              {/* thumbnailUrl is the first image URL found in the post's markdown
                  body (extractFirstImageUrl) — an arbitrary external host, not a
                  fixed bucket. A plain <img> avoids maintaining a next/image
                  remotePatterns allowlist for hosts we don't control (same
                  reasoning as PostCard.tsx). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.thumbnailUrl}
                alt=""
                className={styles.heroImage}
              />
            </div>
          )}

          <PostTagLinks tags={post.tags} />

          <h1 className={styles.title}>{post.title}</h1>
          {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
          <p className={styles.meta}>
            <span data-testid="post-detail-date">
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>{" "}
            · {post.readMinutes} min read
          </p>
        </div>

        {/* id="article-body" spans everything ScrollProgressBar should track —
            article prose through comments — so the bar still reaches 100% at
            the true bottom of substantive content, not partway down the page
            (see content-platform-design.md's scroll-progress rationale: "so
            the nav/footer don't skew it" — prev/next nav, the author card,
            likes, and comments are content, not nav/footer, unlike the page
            header above this point). */}
        <div id="article-body" className={styles.contentStack}>
          <div className={styles.layout}>
            <article className={styles.article}>
              <MarkdownBody bodyMd={post.bodyMd} />
            </article>

            <TableOfContents headings={headings} />
          </div>

          <PostPrevNextNav prevPost={post.prevPost} nextPost={post.nextPost} />

          <PostAuthorCard />

          <RelatedPosts posts={post.relatedPosts} />

          <div className={styles.afterArticle}>
            <LikeButton
              postId={post.id}
              postSlug={post.slug}
              initialLiked={post.liked}
              initialLikeCount={post.likeCount}
            />
            <CommentSection
              postId={post.id}
              postSlug={post.slug}
              initialComments={comments}
            />
          </div>
        </div>
      </main>
    </>
  );
}

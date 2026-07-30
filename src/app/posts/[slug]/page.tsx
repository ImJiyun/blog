import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getComments, categorySection } from "@/lib/api";
import { extractHeadings } from "@/lib/toc";
import MarkdownBody from "@/components/MarkdownBody";
import TableOfContents from "@/components/TableOfContents";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import PostAuthorCard from "@/components/PostAuthorCard";
import PostPrevNextNav from "@/components/PostPrevNextNav";
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

  const [comments, headings] = await Promise.all([
    getComments(post.id),
    Promise.resolve(extractHeadings(post.bodyMd)),
  ]);

  return (
    <>
      <ScrollProgressBar articleId="article-body" />
      <main className={styles.page}>
        <div className={styles.head}>
          <p className={styles.breadcrumb}>
            <Link href={categorySection(post.category).href}>{categorySection(post.category).label}</Link> / {post.category}
          </p>

          {post.thumbnailUrl && (
            <div className={styles.hero}>
              {/* thumbnailUrl is the first image URL found in the post's markdown
                  body (extractFirstImageUrl) — an arbitrary external host, not a
                  fixed bucket. A plain <img> avoids maintaining a next/image
                  remotePatterns allowlist for hosts we don't control (same
                  reasoning as PostCard.tsx). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.thumbnailUrl} alt="" className={styles.heroImage} />
            </div>
          )}

          {post.tags.length > 0 && (
            <ul className={styles.tags} data-testid="post-tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                    className={styles.tagLink}
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h1 className={styles.title}>{post.title}</h1>
          {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
          <p className={styles.meta}>
            {formatDate(post.publishedAt)} · {post.readMinutes} min read
          </p>
        </div>

        <div className={styles.layout}>
          <article id="article-body" className={styles.article}>
            <MarkdownBody bodyMd={post.bodyMd} />
          </article>

          <TableOfContents headings={headings} />
        </div>

        <PostPrevNextNav prevPost={post.prevPost} nextPost={post.nextPost} />

        <PostAuthorCard />

        <div className={styles.afterArticle}>
          <LikeButton postId={post.id} />
          <CommentSection postId={post.id} initialComments={comments} />
        </div>
      </main>
    </>
  );
}

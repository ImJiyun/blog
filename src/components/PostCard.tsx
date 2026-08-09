import Link from "next/link";
import type { Post } from "@/lib/api";
import styles from "./PostCard.module.css";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function PostCard({ post, index }: { post: Post; index?: number }) {
  return (
    <Link href={`/posts/${post.slug}`} className={styles.card} data-testid="post-card">
      <div className={styles.thumbnail}>
        {typeof index === "number" && (
          <span className={styles.indexBadge}>{String(index + 1).padStart(2, "0")}</span>
        )}
        {post.status === "draft" && (
          <span className={styles.statusBadge} data-testid="post-status-badge">
            임시저장
          </span>
        )}
        {post.status === "published" && post.isPublic === false && (
          <span className={styles.statusBadge} data-testid="post-status-badge">
            비공개
          </span>
        )}
        {post.thumbnailUrl ? (
          // thumbnailUrl is the first image URL found in the post's markdown body
          // (extractFirstImageUrl) — an arbitrary external host, not a fixed bucket.
          // A plain <img> avoids maintaining a next/image remotePatterns allowlist
          // for hosts we don't control.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnailUrl} alt="" className={styles.thumbnailImage} />
        ) : (
          <div className={styles.thumbnailFallback}>
            <span className={styles.categoryLabel}>{post.category}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        {post.tags.length > 0 && (
          <div className={styles.tagRow}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tagPill}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <h3 className={styles.title}>{post.title}</h3>
        <div className={styles.meta}>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}

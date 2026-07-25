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

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`} className={styles.card} data-testid="post-card">
      <div className={styles.thumbnail}>
        {post.thumbnailUrl ? (
          // Thumbnails come from an admin-controlled GCS bucket, not user content —
          // a plain <img> avoids configuring next/image remotePatterns for one bucket.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnailUrl} alt="" className={styles.thumbnailImage} />
        ) : (
          <div className={styles.thumbnailFallback}>
            <span className={styles.categoryLabel}>{post.category}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{post.category}</span>
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

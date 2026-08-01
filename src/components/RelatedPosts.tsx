import Link from "next/link";
import styles from "./RelatedPosts.module.css";

type RelatedPost = { slug: string; title: string; publishedAt: string | null };

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div className={styles.section} data-testid="related-posts">
      <h3 className={styles.heading}>관련 글</h3>
      <div className={styles.grid}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`} className={styles.item}>
            <span className={styles.title}>{post.title}</span>
            <span className={styles.meta}>{formatDate(post.publishedAt)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

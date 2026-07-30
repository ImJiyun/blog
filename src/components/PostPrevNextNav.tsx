import Link from "next/link";
import styles from "./PostPrevNextNav.module.css";

type NeighborPost = { slug: string; title: string } | null;

export default function PostPrevNextNav({
  prevPost,
  nextPost,
}: {
  prevPost: NeighborPost;
  nextPost: NeighborPost;
}) {
  if (!prevPost && !nextPost) return null;

  return (
    <div className={styles.row} data-testid="post-prev-next">
      <div>
        {prevPost && (
          <Link href={`/posts/${prevPost.slug}`} className={styles.item}>
            <span className={styles.label}>← 이전 글</span>
            <span className={styles.title}>{prevPost.title}</span>
          </Link>
        )}
      </div>
      <div className={styles.nextCell}>
        {nextPost && (
          <Link href={`/posts/${nextPost.slug}`} className={`${styles.item} ${styles.itemRight}`}>
            <span className={styles.label}>다음 글 →</span>
            <span className={styles.title}>{nextPost.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

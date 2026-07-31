import Link from "next/link";
import { getPosts } from "@/lib/api";
import DeletePostButton from "@/components/DeletePostButton";
import styles from "./page.module.css";

export default async function AdminPostsPage() {
  // GET /api/posts filters on an exact status match with no "all" option, so
  // listing drafts alongside published posts means fetching both and merging —
  // there is no single call that returns everything.
  const [published, drafts] = await Promise.all([
    getPosts({ status: "published" }),
    getPosts({ status: "draft" }),
  ]);
  const posts = [...drafts, ...published].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Posts</h1>
        <Link href="/admin/posts/new" className={styles.newLink} data-testid="new-post-link">
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className={styles.empty}>No posts yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} data-testid="admin-post-row">
                <td>
                  <Link href={`/admin/posts/${post.slug}/edit`}>{post.title}</Link>
                </td>
                <td>{post.category}</td>
                <td className={post.status === "draft" ? styles.draft : styles.published}>
                  {post.status}
                  {!post.isPublic && <span className={styles.privateTag}>Private</span>}
                </td>
                <td>{new Date(post.updatedAt).toLocaleDateString("ko-KR")}</td>
                <td className={styles.actions}>
                  <Link href={`/admin/posts/${post.slug}/edit`}>Edit</Link>
                  <DeletePostButton postId={post.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

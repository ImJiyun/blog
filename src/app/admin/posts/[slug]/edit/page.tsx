import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost } from "@/lib/api";
import PostForm from "@/components/PostForm";
import styles from "./page.module.css";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className={styles.page}>
      <Link href="/admin/posts" className={styles.backLink}>
        ← 목록으로
      </Link>
      <h1 className={styles.title}>Edit Post</h1>
      <PostForm initialPost={post} />
    </main>
  );
}

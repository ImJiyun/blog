import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getCategories } from "@/lib/api";
import PostForm from "@/components/PostForm";
import styles from "./page.module.css";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([getPost(slug), getCategories()]);
  if (!post) notFound();

  return (
    <main className={styles.page}>
      <Link href="/admin/posts" className={styles.backLink}>
        ← 목록으로
      </Link>
      <h1 className={styles.title}>Edit Post</h1>
      <PostForm initialPost={post} categories={categories} />
    </main>
  );
}

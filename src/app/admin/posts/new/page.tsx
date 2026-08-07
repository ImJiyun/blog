import Link from "next/link";
import PostForm from "@/components/PostForm";
import styles from "./page.module.css";

export default function NewPostPage() {
  return (
    <main className={styles.page}>
      <Link href="/admin/posts" className={styles.backLink}>
        ← 목록으로
      </Link>
      <h1 className={styles.title}>New Post</h1>
      <PostForm />
    </main>
  );
}

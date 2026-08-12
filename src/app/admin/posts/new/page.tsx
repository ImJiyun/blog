import Link from "next/link";
import PostForm from "@/components/PostForm";
import { getCategories } from "@/lib/api";
import styles from "./page.module.css";

export default async function NewPostPage() {
  const categories = await getCategories();
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← 홈으로 돌아가기
      </Link>
      <h1 className={styles.title}>New Post</h1>
      <PostForm categories={categories} />
    </main>
  );
}

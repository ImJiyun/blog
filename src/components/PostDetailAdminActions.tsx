"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/api";
import styles from "./PostDetailAdminActions.module.css";

export default function PostDetailAdminActions({
  postId,
  slug,
}: {
  postId: string;
  slug: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm("이 글을 삭제할까요?")) return;
    setPending(true);
    try {
      await deletePost(postId);
      router.push("/");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.actions}>
      <Link
        href={`/admin/posts/${slug}/edit`}
        className={styles.editButton}
        aria-disabled={pending}
        tabIndex={pending ? -1 : undefined}
        onClick={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        수정
      </Link>
      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDelete}
        disabled={pending}
        data-testid="post-detail-delete-button"
      >
        {pending ? "삭제 중..." : "삭제"}
      </button>
    </div>
  );
}

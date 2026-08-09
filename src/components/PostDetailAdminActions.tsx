"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeletePost } from "@/lib/useDeletePost";
import styles from "./PostDetailAdminActions.module.css";

export default function PostDetailAdminActions({
  postId,
  slug,
}: {
  postId: string;
  slug: string;
}) {
  const router = useRouter();
  const { pending, handleDelete } = useDeletePost({
    postId,
    confirmMessage: "이 글을 삭제할까요?",
    errorMessage: "삭제에 실패했습니다.",
    onSuccess: () => router.push("/"),
  });

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

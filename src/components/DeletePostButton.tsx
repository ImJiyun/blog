"use client";

import { useRouter } from "next/navigation";
import { useDeletePost } from "@/lib/useDeletePost";
import styles from "./DeletePostButton.module.css";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const { pending, handleDelete } = useDeletePost({
    postId,
    confirmMessage: "Delete this post? This cannot be undone.",
    errorMessage: "Failed to delete post.",
    onSuccess: () => router.refresh(),
  });

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleDelete}
      disabled={pending}
      data-testid="delete-post-button"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

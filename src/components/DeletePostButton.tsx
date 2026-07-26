"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/api";
import styles from "./DeletePostButton.module.css";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setPending(true);
    try {
      await deletePost(postId);
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete post.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      disabled={pending}
      data-testid="delete-post-button"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

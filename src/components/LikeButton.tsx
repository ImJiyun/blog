"use client";

import { useState } from "react";
import { toggleLike } from "@/lib/api";
import styles from "./LikeButton.module.css";

export default function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    try {
      const result = await toggleLike(postId);
      setLiked(result.liked);
    } catch {
      // best-effort UI — a failed toggle just leaves the button's state unchanged
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={liked ? `${styles.button} ${styles.liked}` : styles.button}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={liked}
      data-testid="like-button"
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {liked ? "Liked" : "Like"}
    </button>
  );
}

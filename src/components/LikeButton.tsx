"use client";

import { useState } from "react";
import { toggleLike } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import styles from "./LikeButton.module.css";

type Props = { postId: string; initialLiked: boolean; initialLikeCount: number };

export default function LikeButton({ postId, initialLiked, initialLikeCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    trackEvent("click", { target_type: "like", post_id: postId });
    setPending(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const result = await toggleLike(postId);
      setLiked(result.liked);
      setLikeCount(result.liked ? prevCount + 1 : prevCount - 1);
    } catch {
      // best-effort UI — a failed toggle rolls back to the pre-click state
      setLiked(prevLiked);
      setLikeCount(prevCount);
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
      <span aria-hidden="true" className={liked ? `${styles.dot} ${styles.dotLiked}` : styles.dot} />
      좋아요 {likeCount}
    </button>
  );
}

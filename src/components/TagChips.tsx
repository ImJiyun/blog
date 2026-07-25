"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TagCount } from "@/lib/api";
import styles from "./TagChips.module.css";

export default function TagChips({
  tags,
  basePath,
}: {
  tags: TagCount[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  function selectTag(tag: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (activeTag === tag) {
      next.delete("tag");
    } else {
      next.set("tag", tag);
    }
    const qs = next.toString();
    router.push(`${basePath}${qs ? `?${qs}` : ""}`);
  }

  if (tags.length === 0) return null;

  return (
    <div className={styles.row} data-testid="tag-chips">
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          type="button"
          className={
            activeTag === tag ? `${styles.chip} ${styles.active}` : styles.chip
          }
          onClick={() => selectTag(tag)}
          data-testid={`tag-chip-${tag}`}
          aria-pressed={activeTag === tag}
        >
          <span className={styles.chipTag}>{tag}</span>
          <span className={styles.chipCount}>{count}</span>
        </button>
      ))}
    </div>
  );
}

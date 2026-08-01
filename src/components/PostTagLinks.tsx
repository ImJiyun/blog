"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import styles from "./PostTagLinks.module.css";

export default function PostTagLinks({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className={styles.tags} data-testid="post-tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/posts?tag=${encodeURIComponent(tag)}`}
            className={styles.tagLink}
            onClick={() => trackEvent("click", { target_type: "tag", tag })}
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

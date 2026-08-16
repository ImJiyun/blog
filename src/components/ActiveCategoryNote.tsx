"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import styles from "./ActiveCategoryNote.module.css";

export default function ActiveCategoryNote({
  category,
  basePath,
  tag,
  q,
}: {
  category?: string;
  basePath: string;
  tag?: string;
  q?: string;
}) {
  if (!category) return null;

  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const qs = params.toString();

  return (
    <p className={styles.note}>
      <strong>{category}</strong>만 보는 중 ·{" "}
      <Link
        href={`${basePath}${qs ? `?${qs}` : ""}`}
        onClick={() =>
          trackEvent("click", { target_type: "category_reset", category })
        }
      >
        전체 보기
      </Link>
    </p>
  );
}

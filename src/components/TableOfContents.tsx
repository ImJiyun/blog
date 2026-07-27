"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";
import styles from "./TableOfContents.module.css";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents" data-testid="toc">
      <div className={styles.label}>목차</div>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? styles.nested : undefined}
          >
            <a
              href={`#${heading.id}`}
              className={
                activeId === heading.id ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

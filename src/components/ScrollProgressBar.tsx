"use client";

import { useEffect, useState } from "react";
import { computeScrollProgress } from "@/lib/scrollProgress";
import styles from "./ScrollProgressBar.module.css";

export default function ScrollProgressBar({ articleId }: { articleId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const article = document.getElementById(articleId);
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      setProgress(
        computeScrollProgress({
          articleTop,
          articleHeight: article.scrollHeight,
          scrollY: window.scrollY,
          viewportHeight: window.innerHeight,
        }),
      );
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [articleId]);

  return (
    <div className={styles.track} aria-hidden="true">
      <div
        className={styles.bar}
        style={{ width: `${progress}%` }}
        data-testid="scroll-progress-bar"
      />
    </div>
  );
}

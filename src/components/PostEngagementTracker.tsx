"use client";

import { useEffect, useRef } from "react";
import { computeScrollProgress } from "@/lib/scrollProgress";
import { crossedThresholds, computeReadingSeconds, trackEvent } from "@/lib/analytics";

export default function PostEngagementTracker({ postSlug }: { postSlug: string }) {
  const firedRef = useRef<number[]>([]);
  const startRef = useRef<number>(Date.now());
  const readingSentRef = useRef(false);

  useEffect(() => {
    function handleScroll() {
      const article = document.getElementById("article-body");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const percent = computeScrollProgress({
        articleTop,
        articleHeight: article.scrollHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
      });
      const newlyCrossed = crossedThresholds(percent, firedRef.current);
      for (const depth of newlyCrossed) {
        trackEvent("scroll_depth", { depth_percentage: depth, post_slug: postSlug });
      }
      if (newlyCrossed.length > 0) {
        firedRef.current = [...firedRef.current, ...newlyCrossed];
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "hidden" || readingSentRef.current) return;
      readingSentRef.current = true;
      const seconds = computeReadingSeconds(startRef.current, Date.now());
      trackEvent("reading_time", { seconds, post_slug: postSlug });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [postSlug]);

  return null;
}

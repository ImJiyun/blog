"use client";

import { useEffect, useRef } from "react";
import { computeScrollProgress } from "@/lib/scrollProgress";
import { crossedThresholds, computeReadingSeconds, trackEvent } from "@/lib/analytics";

export default function PostEngagementTracker({ postSlug }: { postSlug: string }) {
  const firedRef = useRef<number[]>([]);
  const startRef = useRef<number>(Date.now());
  const readingSentRef = useRef(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    firedRef.current = [];
    startRef.current = Date.now();
    readingSentRef.current = false;
    tickingRef.current = false;

    function measureScroll() {
      tickingRef.current = false;
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

    function handleScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(measureScroll);
    }

    function sendReadingTime() {
      if (readingSentRef.current) return;
      readingSentRef.current = true;
      const seconds = computeReadingSeconds(startRef.current, Date.now());
      trackEvent("reading_time", { seconds, post_slug: postSlug });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") sendReadingTime();
    }

    measureScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // SPA navigation to another post (RelatedPosts, prev/next) never fires
      // visibilitychange, so flush here too or reading_time is lost on the
      // most common exit path.
      sendReadingTime();
    };
  }, [postSlug]);

  return null;
}

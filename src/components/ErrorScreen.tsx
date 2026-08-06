"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./ErrorScreen.module.css";

// This screen overlays the whole viewport, but the real site header/footer
// (src/components/Nav.tsx, Footer.tsx) still mount underneath it — Next.js keeps
// the root layout alive under not-found.tsx/error.tsx. `position: fixed` only
// hides them visually, not from the DOM, so without this they'd stay reachable by
// keyboard/screen reader while invisible. `inert` removes them from the
// accessibility tree and tab order for as long as this screen is shown.
function setChromeInert(inert: boolean) {
  for (const id of ["site-nav", "site-footer"]) {
    const el = document.getElementById(id);
    if (el) el.inert = inert;
  }
}

export default function ErrorScreen({
  code,
  title,
  message,
  children,
}: {
  code: string;
  title: string;
  message: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setChromeInert(true);
    return () => setChromeInert(false);
  }, []);

  return (
    <div className={styles.screen}>
      <Link href="/" className={styles.wordmark}>
        <span className={styles.wordmarkPrompt}>&gt;</span>hanul.dev
      </Link>
      <div className={styles.code}>{code}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{message}</p>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

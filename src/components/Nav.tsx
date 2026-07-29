"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import styles from "./Nav.module.css";
import ThemeToggle from "./ThemeToggle";
import NavSearch from "./NavSearch";

const TABS = [
  { label: "Latest", href: "/" },
  { label: "Study", href: "/study" },
  { label: "Life", href: "/life" },
  { label: "Project", href: "/project" },
];

const GITHUB_URL = "https://github.com/ImJiyun";

function isActiveTab(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Post detail pages and the whole admin area are functional/reading screens, not
// browsing entry points — the avatar and site-wide tab nav are dropped there so they
// don't compete with the article body or admin tools. The wordmark, theme toggle, and
// GitHub link stay everywhere.
function isMinimalHeader(pathname: string): boolean {
  return pathname.startsWith("/posts/") || pathname.startsWith("/admin");
}

export default function Nav() {
  const pathname = usePathname();
  const minimal = isMinimalHeader(pathname);

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.wordmark}>
          <span className={styles.wordmarkPrompt}>&gt;</span>jiyun.dev
        </Link>
        <div className={styles.topBarActions}>
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.githubButton}
          >
            GitHub
          </a>
        </div>
      </div>

      {!minimal && (
        <div className={styles.avatar}>
          {/* Decorative — the "jiyun.dev" wordmark above already carries the site's
              text identity, so this doesn't need alt text of its own. */}
          <Image
            src="/character.jpg"
            alt=""
            width={88}
            height={88}
            className={styles.avatarImage}
            priority
          />
          <p className={styles.avatarTagline}>
            데이터와 일상을 기록하는 jiyun.dev 입니다.
          </p>
        </div>
      )}

      {!minimal && (
        <nav className={styles.tabNav} aria-label="Primary">
          <ul className={styles.tabList}>
            {TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={
                    isActiveTab(pathname, tab.href)
                      ? `${styles.tab} ${styles.tabActive}`
                      : styles.tab
                  }
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
          <Suspense fallback={<div className={styles.searchForm} />}>
            <NavSearch />
          </Suspense>
        </nav>
      )}
    </header>
  );
}

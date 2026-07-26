"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";
import ThemeToggle from "./ThemeToggle";

const TABS = [
  { label: "Latest", href: "/" },
  { label: "Study", href: "/study" },
  { label: "Life", href: "/life" },
  { label: "About", href: "/about" },
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
          jiyun.dev
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
          <Link href="/posts" className={styles.searchIcon} aria-label="Search posts">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <line
                x1="12.5"
                y1="12.5"
                x2="17"
                y2="17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </nav>
      )}
    </header>
  );
}

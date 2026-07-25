"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

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

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className={styles.githubButton}
        >
          GitHub
        </a>
      </div>

      {isHome && (
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Data Learning Platform</h1>
        </div>
      )}

      <nav
        className={isHome ? styles.tabNav : `${styles.tabNav} ${styles.tabNavSlim}`}
        aria-label="Primary"
      >
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
    </header>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.css";
import ThemeToggle from "./ThemeToggle";

const TABS = [
  { label: "Latest", href: "/" },
  { label: "Study", href: "/study" },
  { label: "Life", href: "/life" },
  { label: "About", href: "/about" },
];

const GITHUB_URL = "https://github.com/ImJiyun";
const SEARCH_DEBOUNCE_MS = 300;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const minimal = isMinimalHeader(pathname);

  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the box in sync with the URL: reflect ?q= while on /posts, clear it
  // on any other route (e.g. clicking a tab away from a search).
  //
  // The cleanup below cancels any debounced pushQuery scheduled by
  // handleChange. That timeout closes over the pathname/searchParams from
  // the render when the keystroke happened, so if the route changes before
  // the timer fires, the stale closure would call
  // router.replace("/posts?q=...") and force-navigate the user back to
  // /posts even though they've already left. React runs an effect's cleanup
  // right before the effect re-runs (i.e. whenever pathname/searchParams
  // actually change) and also on unmount, so this one cleanup covers both
  // the route-change race and the "no cleanup on unmount" case.
  useEffect(() => {
    setQuery(pathname === "/posts" ? searchParams.get("q") ?? "" : "");
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [pathname, searchParams]);

  function pushQuery(value: string) {
    const next = new URLSearchParams(pathname === "/posts" ? searchParams.toString() : "");
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    const qs = next.toString();
    router.replace(`/posts${qs ? `?${qs}` : ""}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushQuery(value), SEARCH_DEBOUNCE_MS);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushQuery(query);
  }

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
          <form role="search" className={styles.searchForm} onSubmit={handleSubmit}>
            <input
              type="search"
              value={query}
              onChange={handleChange}
              placeholder="Search posts"
              aria-label="Search posts"
              data-testid="nav-search-input"
              className={styles.searchInput}
            />
          </form>
        </nav>
      )}
    </header>
  );
}

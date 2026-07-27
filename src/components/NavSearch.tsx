"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./Nav.module.css";

const SEARCH_DEBOUNCE_MS = 300;

export default function NavSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    const v = value.trim();
    const onPosts = pathname === "/posts";
    if (!v && !onPosts) return; // nothing to clear, don't navigate away
    const next = new URLSearchParams(onPosts ? searchParams.toString() : "");
    if (v) {
      next.set("q", v);
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
  );
}

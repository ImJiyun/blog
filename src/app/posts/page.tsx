import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getPosts, getTags } from "@/lib/api";
import styles from "./page.module.css";

type SearchParams = { category?: string; tag?: string; q?: string };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, tag, q } = await searchParams;

  const [posts, tags] = await Promise.all([
    getPosts({ category, tag, q }),
    getTags(),
  ]);

  return (
    <main>
      <form action="/posts" method="get" className={styles.searchForm}>
        {category && <input type="hidden" name="category" value={category} />}
        {tag && <input type="hidden" name="tag" value={tag} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search posts"
          aria-label="Search posts"
          data-testid="posts-search-input"
          className={styles.searchInput}
        />
        <button type="submit" data-testid="posts-search-submit" className={styles.searchSubmit}>
          Search
        </button>
      </form>

      <TagChips tags={tags} basePath="/posts" />

      {posts.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--ink-soft)" }}>
          No posts found.
        </p>
      ) : (
        <PostGrid>
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </PostGrid>
      )}
    </main>
  );
}

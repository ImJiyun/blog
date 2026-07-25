import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getPosts, getTags } from "@/lib/api";

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
      <form
        action="/posts"
        method="get"
        style={{
          maxWidth: 960,
          margin: "2rem auto 0",
          padding: "0 1.5rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search posts"
          aria-label="Search posts"
          data-testid="posts-search-input"
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            border: "1px solid var(--border)",
            borderRadius: 4,
            font: "inherit",
            background: "var(--bg)",
            color: "var(--ink)",
          }}
        />
        <button
          type="submit"
          data-testid="posts-search-submit"
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "var(--bg)",
            color: "var(--ink)",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
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
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </PostGrid>
      )}
    </main>
  );
}

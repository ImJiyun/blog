import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import ActiveCategoryNote from "@/components/ActiveCategoryNote";
import { getViewablePosts, getTags } from "@/lib/api";
import { isAdminFromCookies } from "@/lib/auth";

type SearchParams = { category?: string; tag?: string; q?: string };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, tag, q } = await searchParams;
  const isAdmin = await isAdminFromCookies();

  const [posts, tags] = await Promise.all([
    getViewablePosts({ category, tag, q }, isAdmin),
    // /posts has no section to pre-restrict categories by (unlike /data, /dev,
    // /life), so scope tags to the active category filter itself when present
    // — otherwise the chip list leaks tags from every other category (#163).
    getTags(category ? [category] : undefined),
  ]);

  return (
    <main>
      {q && (
        <p style={{ textAlign: "center", padding: "2rem 1.5rem 0", color: "var(--ink-soft)" }}>
          &ldquo;{q}&rdquo; 검색결과 · 전체 글
        </p>
      )}

      <ActiveCategoryNote category={category} basePath="/posts" tag={tag} q={q} />
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

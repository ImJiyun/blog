import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getViewablePosts, getTags, DATA_CATEGORIES } from "@/lib/api";
import { isAdminFromCookies } from "@/lib/auth";

type SearchParams = { category?: string; tag?: string; q?: string };
const ALLOWED: readonly string[] = DATA_CATEGORIES;

export default async function DataPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, tag, q } = await searchParams;
  const effectiveCategory = category && ALLOWED.includes(category) ? category : undefined;
  const isAdmin = await isAdminFromCookies();

  const [posts, tags] = await Promise.all([
    getViewablePosts({ category: effectiveCategory, tag, q }, isAdmin),
    getTags(DATA_CATEGORIES),
  ]);
  const filtered = effectiveCategory
    ? posts
    : posts.filter((post) => ALLOWED.includes(post.category));

  return (
    <main>
      <TagChips tags={tags} basePath="/data" />
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--ink-soft)" }}>
          No posts found.
        </p>
      ) : (
        <PostGrid>
          {filtered.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </PostGrid>
      )}
    </main>
  );
}

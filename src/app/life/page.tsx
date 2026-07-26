import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getPosts, getTags, LIFE_CATEGORIES } from "@/lib/api";

type SearchParams = { category?: string; tag?: string; q?: string };
const ALLOWED: readonly string[] = LIFE_CATEGORIES;

export default async function LifePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, tag, q } = await searchParams;
  const effectiveCategory = category && ALLOWED.includes(category) ? category : undefined;

  const [posts, tags] = await Promise.all([
    getPosts({ category: effectiveCategory, tag, q }),
    getTags(),
  ]);
  const filtered = effectiveCategory
    ? posts
    : posts.filter((post) => ALLOWED.includes(post.category));

  return (
    <main>
      <TagChips tags={tags} basePath="/life" />
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--ink-soft)" }}>
          No posts found.
        </p>
      ) : (
        <PostGrid>
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </PostGrid>
      )}
    </main>
  );
}

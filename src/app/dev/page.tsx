import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getViewablePosts, getTags, getCategories } from "@/lib/api";
import { isAdminFromCookies } from "@/lib/auth";

type SearchParams = { category?: string; tag?: string; q?: string };

export default async function DevPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, tag, q } = await searchParams;
  const isAdmin = await isAdminFromCookies();
  const categories = await getCategories();
  const allowed = categories.filter((c) => c.section === "dev").map((c) => c.name);
  const effectiveCategory = category && allowed.includes(category) ? category : undefined;

  const [posts, tags] = await Promise.all([
    getViewablePosts({ category: effectiveCategory, tag, q }, isAdmin),
    getTags(allowed),
  ]);
  const filtered = effectiveCategory
    ? posts
    : posts.filter((post) => allowed.includes(post.category));

  return (
    <main>
      <TagChips tags={tags} basePath="/dev" />
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

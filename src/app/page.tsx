import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getViewablePosts, getTags, getCategories } from "@/lib/api";
import type { Post } from "@/lib/api";
import { isAdminFromCookies } from "@/lib/auth";

type SearchParams = { tag?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tag } = await searchParams;
  const isAdmin = await isAdminFromCookies();
  const categories = await getCategories();
  const latestCategoryNames = categories.filter((c) => c.section !== "life").map((c) => c.name);

  const [posts, tags] = await Promise.all([
    getViewablePosts({ tag }, isAdmin),
    getTags(latestCategoryNames),
  ]);
  const latest: Post[] = posts.filter((post) => latestCategoryNames.includes(post.category));

  return (
    <main>
      <h1 className="sr-only">Latest</h1>
      <TagChips tags={tags} basePath="/" />
      {latest.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--ink-soft)" }}>
          No posts yet.
        </p>
      ) : (
        <PostGrid>
          {latest.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </PostGrid>
      )}
    </main>
  );
}

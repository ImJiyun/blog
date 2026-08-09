import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import TagChips from "@/components/TagChips";
import { getViewablePosts, getTags, LATEST_CATEGORIES, LIFE_CATEGORIES } from "@/lib/api";
import type { Post } from "@/lib/api";
import { isAdminFromCookies } from "@/lib/auth";

type SearchParams = { tag?: string };

function isLifeCategory(category: string): boolean {
  return (LIFE_CATEGORIES as readonly string[]).includes(category);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tag } = await searchParams;
  const isAdmin = await isAdminFromCookies();

  const [posts, tags] = await Promise.all([
    getViewablePosts({ tag }, isAdmin),
    getTags(LATEST_CATEGORIES),
  ]);
  const latest: Post[] = posts.filter((post) => !isLifeCategory(post.category));

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

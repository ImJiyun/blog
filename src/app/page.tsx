import PostCard from "@/components/PostCard";
import PostGrid from "@/components/PostGrid";
import { getPosts, LIFE_CATEGORIES } from "@/lib/api";
import type { Post } from "@/lib/api";

function isLifeCategory(category: string): boolean {
  return (LIFE_CATEGORIES as readonly string[]).includes(category);
}

export default async function HomePage() {
  const posts = await getPosts({ status: "published" });
  const latest: Post[] = posts.filter((post) => !isLifeCategory(post.category));

  return (
    <main>
      <h1 className="sr-only">Latest</h1>
      {latest.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--ink-soft)" }}>
          No posts yet.
        </p>
      ) : (
        <PostGrid>
          {latest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </PostGrid>
      )}
    </main>
  );
}

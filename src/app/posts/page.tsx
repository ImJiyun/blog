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
      {q && (
        <p style={{ textAlign: "center", padding: "2rem 1.5rem 0", color: "var(--ink-soft)" }}>
          &ldquo;{q}&rdquo; 검색결과 · 전체 글
        </p>
      )}

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

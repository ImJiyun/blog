import { notFound } from "next/navigation";
import { getPost } from "@/lib/api";
import PostForm from "@/components/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main style={{ padding: "2.5rem 1.5rem 6rem" }}>
      <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, color: "var(--ink)" }}>
        Edit Post
      </h1>
      <PostForm initialPost={post} />
    </main>
  );
}

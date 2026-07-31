import PostForm from "@/components/PostForm";

export default function NewPostPage() {
  return (
    <main style={{ maxWidth: 1148, margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>
      <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 900, color: "var(--ink)" }}>
        New Post
      </h1>
      <PostForm />
    </main>
  );
}

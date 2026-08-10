export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  readMinutes: number;
  category: string;
  tags: string[];
  status: PostStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// The shape returned only by GET /api/posts/{slug} (getPost()) — list responses
// (getPosts()) and write responses (createPost()/updatePost()) don't include
// these neighbor fields, so they stay off the base Post type.
export type PostDetail = Post & {
  prevPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
  relatedPosts: { slug: string; title: string; publishedAt: string | null }[];
  likeCount: number;
  liked: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  parentCommentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

// Single source of truth for the draft/private status label shown on both
// PostCard and the post detail page — kept as one function after #127 (the
// two views drifted out of sync when this logic was duplicated inline).
export function getPostStatusBadgeLabel(
  post: Pick<Post, "status" | "isPublic">,
): string | null {
  if (post.status === "draft") return "임시저장";
  if (post.isPublic === false) return "비공개";
  return null;
}

export type TagCount = { tag: string; count: number };

export const DATA_CATEGORIES = [
  "SQL",
  "Python",
  "Statistics",
  "Tableau",
  "PowerBI",
] as const;

export const DEV_CATEGORIES: readonly string[] = [];

export const LIFE_CATEGORIES = ["Travel", "Career"] as const;

export const ALL_CATEGORIES = [
  ...DATA_CATEGORIES,
  ...DEV_CATEGORIES,
  "Projects",
  ...LIFE_CATEGORIES,
] as const;

export const LATEST_CATEGORIES: readonly string[] = ALL_CATEGORIES.filter(
  (c) => !(LIFE_CATEGORIES as readonly string[]).includes(c),
);

export function categorySection(category: string): { label: string; href: string } {
  if ((LIFE_CATEGORIES as readonly string[]).includes(category)) {
    return { label: "Life", href: "/life" };
  }
  if ((DATA_CATEGORIES as readonly string[]).includes(category)) {
    return { label: "Data", href: "/data" };
  }
  if ((DEV_CATEGORIES as readonly string[]).includes(category)) {
    return { label: "Dev", href: "/dev" };
  }
  return { label: "Latest", href: "/" };
}

export function sectionCategories(category: string): readonly string[] {
  if ((LIFE_CATEGORIES as readonly string[]).includes(category)) {
    return LIFE_CATEGORIES;
  }
  if ((DATA_CATEGORIES as readonly string[]).includes(category)) {
    return DATA_CATEGORIES;
  }
  if ((DEV_CATEGORIES as readonly string[]).includes(category)) {
    return DEV_CATEGORIES;
  }
  return ALL_CATEGORIES.filter(
    (c) =>
      !(DATA_CATEGORIES as readonly string[]).includes(c) &&
      !(DEV_CATEGORIES as readonly string[]).includes(c) &&
      !(LIFE_CATEGORIES as readonly string[]).includes(c),
  );
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

// Server Components only — no implicit origin or cookie jar the way a browser
// has, so this builds an absolute URL and forwards the incoming request's
// cookies explicitly. That forwarding is what lets an authenticated admin
// load a draft through the same GET /api/posts/{slug} a public visitor uses
// (the backend's isAdmin(request) check reads the forwarded `token` cookie);
// for a visitor with no `token` cookie, nothing extra is forwarded and drafts
// 404 as normal.
async function serverFetch(path: string): Promise<Response> {
  const { cookies } = await import("next/headers");
  const cookieHeader = (await cookies()).toString();
  return fetch(`${getBaseUrl()}${path}`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return (body && typeof body.error === "string" && body.error) || fallback;
}

export type GetPostsParams = {
  category?: string;
  tag?: string;
  q?: string;
  status?: PostStatus;
};

export async function getPosts(params: GetPostsParams = {}): Promise<Post[]> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();

  const response = await serverFetch(`/api/posts${qs ? `?${qs}` : ""}`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load posts"));
  }
  return response.json();
}

export function mergePublishedAndDrafts(published: Post[], drafts: Post[]): Post[] {
  return [...drafts, ...published].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getViewablePosts(
  params: Omit<GetPostsParams, "status">,
  isAdmin: boolean,
): Promise<Post[]> {
  if (!isAdmin) return getPosts({ ...params, status: "published" });
  const [published, drafts] = await Promise.all([
    getPosts({ ...params, status: "published" }),
    getPosts({ ...params, status: "draft" }),
  ]);
  return mergePublishedAndDrafts(published, drafts);
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  // Next's dynamic route params arrive still percent-encoded for non-ASCII
  // segments (verified against this Next/Turbopack version) — decode first so
  // a Korean slug isn't encoded twice, which would 404 against the backend.
  // decodeURIComponent is a no-op on an already-plain string, so this is safe
  // regardless of whether params ever start arriving pre-decoded.
  const response = await serverFetch(`/api/posts/${encodeURIComponent(decodeURIComponent(slug))}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load post"));
  }
  return response.json();
}

export async function getTags(categories?: readonly string[]): Promise<TagCount[]> {
  const search = new URLSearchParams();
  if (categories?.length) search.set("categories", categories.join(","));
  const qs = search.toString();

  const response = await serverFetch(`/api/tags${qs ? `?${qs}` : ""}`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load tags"));
  }
  return response.json();
}

export async function getComments(postId: string): Promise<Comment[]> {
  const response = await serverFetch(`/api/posts/${postId}/comments`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load comments"));
  }
  return response.json();
}

export type CreateCommentInput = {
  authorName: string;
  body: string;
  parentCommentId?: string;
};

// Client Components only, below this line — a relative path resolves against
// the browser's current origin and its cookies go along automatically, so
// none of these need serverFetch's absolute-URL/cookie-forwarding treatment.

export async function createComment(
  postId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to post comment"));
  }
  return response.json();
}

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
  const response = await fetch(`/api/posts/${postId}/likes`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to toggle like"));
  }
  return response.json();
}

export async function login(password: string): Promise<void> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Login failed"));
  }
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Logout failed"));
  }
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response, "Failed to delete post"));
  }
}

export type PostInput = {
  title: string;
  bodyMd: string;
  subtitle: string | null;
  category: string;
  tags: string[];
  status: PostStatus;
  isPublic: boolean;
};

export async function createPost(input: PostInput): Promise<Post> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to create post"));
  }
  return response.json();
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to update post"));
  }
  return response.json();
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch("/api/uploads", { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to upload image"));
  }
  return response.json();
}

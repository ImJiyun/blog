export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  thumbnailUrl: string | null;
  readMinutes: number;
  category: string;
  tags: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type Comment = {
  id: string;
  postId: string;
  parentCommentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

export type TagCount = { tag: string; count: number };

export const STUDY_CATEGORIES = [
  "SQL",
  "Python",
  "Statistics",
  "Tableau",
  "PowerBI",
] as const;

export const LIFE_CATEGORIES = ["Travel", "Career"] as const;

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

export async function getPost(slug: string): Promise<Post | null> {
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

export async function getTags(): Promise<TagCount[]> {
  const response = await serverFetch("/api/tags");
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

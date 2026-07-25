export function slugify(title: string): string {
  let slug = title.trim().toLowerCase();
  slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, "");
  slug = slug.replace(/[\s_-]+/gu, "-").replace(/^-+|-+$/g, "");
  if (!slug) {
    slug = Math.random().toString(36).slice(2, 10);
  }
  return slug;
}

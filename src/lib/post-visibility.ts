export function postVisibilityWhere(options?: { status?: string; isAdmin?: boolean }) {
  const status = options?.status ?? "published";
  const isAdmin = options?.isAdmin ?? false;
  return {
    status,
    ...(isAdmin ? {} : { isPublic: true }),
  };
}

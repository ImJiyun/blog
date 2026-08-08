export const ADMIN_FAB_PATHS = ["/", "/study", "/life", "/project", "/posts"] as const;

export function isAdminFabPath(pathname: string): boolean {
  return (ADMIN_FAB_PATHS as readonly string[]).includes(pathname);
}

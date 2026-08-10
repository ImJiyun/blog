export const ADMIN_FAB_PATHS = ["/", "/data", "/dev", "/life", "/posts"] as const;

export function isAdminFabPath(pathname: string): boolean {
  return (ADMIN_FAB_PATHS as readonly string[]).includes(pathname);
}

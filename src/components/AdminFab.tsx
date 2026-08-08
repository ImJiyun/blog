"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminFabPath } from "@/lib/adminFab";
import styles from "./AdminFab.module.css";

export default function AdminFab({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  if (!isAdmin || !isAdminFabPath(pathname)) return null;

  return (
    <Link
      href="/admin/posts/new"
      aria-label="새 글 작성"
      className={styles.fab}
      data-testid="admin-fab-new-post"
    >
      +
    </Link>
  );
}

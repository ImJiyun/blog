"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import styles from "./AdminModeBadge.module.css";

export default function AdminModeBadge() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await logout();
    } catch {
      // 실패해도 조용히 무시 — 다시 누르면 됨
    } finally {
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.badge}
      onClick={handleClick}
      disabled={pending}
      data-testid="admin-mode-badge"
    >
      관리자 모드 · 로그아웃
    </button>
  );
}

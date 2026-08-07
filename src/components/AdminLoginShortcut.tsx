"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import styles from "./AdminLoginShortcut.module.css";

export default function AdminLoginShortcut({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "l";
      if (isShortcut) {
        event.preventDefault();
        if (isAdmin) return;
        setOpen(true);
        setPassword("");
        setError(null);
        return;
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdmin]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(password);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => setOpen(false)}
      data-testid="admin-login-modal"
    >
      <form
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        data-testid="login-form"
      >
        <h3 className={styles.title}>관리자 로그인</h3>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          data-testid="password-input"
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonRow}>
          <button type="button" onClick={() => setOpen(false)} data-testid="login-cancel">
            취소
          </button>
          <button type="submit" disabled={submitting} data-testid="login-submit">
            {submitting ? "Logging in..." : "로그인"}
          </button>
        </div>
      </form>
    </div>
  );
}

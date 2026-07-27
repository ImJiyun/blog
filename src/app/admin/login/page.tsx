"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(password);
      router.push("/admin/posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} data-testid="login-form">
        <h1 className={styles.title}>
          <span className={styles.titlePrompt}>&gt;</span>jiyun.dev/admin
        </h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="password-input"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={submitting} data-testid="login-submit">
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}

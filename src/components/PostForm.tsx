"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createPost,
  updatePost,
  uploadImage,
  ALL_CATEGORIES,
} from "@/lib/api";
import type { Post, PostStatus } from "@/lib/api";
import styles from "./PostForm.module.css";

export default function PostForm({ initialPost }: { initialPost?: Post }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [category, setCategory] = useState(initialPost?.category ?? ALL_CATEGORIES[0]);
  const [tagsText, setTagsText] = useState(initialPost?.tags.join(", ") ?? "");
  const [bodyMd, setBodyMd] = useState(initialPost?.bodyMd ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseTags(): string[] {
    return tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      const markdownImage = `![](${url})`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        setBodyMd((prev) => prev.slice(0, start) + markdownImage + prev.slice(end));
        requestAnimationFrame(() => {
          textarea.focus();
          const cursor = start + markdownImage.length;
          textarea.setSelectionRange(cursor, cursor);
        });
      } else {
        setBodyMd((prev) => `${prev}\n${markdownImage}\n`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSave(status: PostStatus) {
    setError(null);
    if (!title.trim() || !bodyMd.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    try {
      const input = { title: title.trim(), bodyMd, category, tags: parseTags(), status };
      if (initialPost) {
        await updatePost(initialPost.id, input);
      } else {
        await createPost(input);
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      {error && <p className={styles.error}>{error}</p>}

      <label className={styles.field}>
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="post-title-input"
        />
      </label>

      <label className={styles.field}>
        <span>Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          data-testid="post-category-select"
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Tags (comma-separated)</span>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          data-testid="post-tags-input"
        />
      </label>

      <div className={styles.toolbar}>
        <label className={styles.uploadButton}>
          {uploading ? "Uploading..." : "Insert Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className={styles.fileInput}
            data-testid="image-upload-input"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Body (Markdown)</span>
        <textarea
          ref={textareaRef}
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value)}
          rows={20}
          data-testid="post-body-textarea"
        />
      </label>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={saving}
          data-testid="save-draft-button"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave("published")}
          disabled={saving}
          data-testid="publish-button"
        >
          Publish
        </button>
      </div>
    </form>
  );
}

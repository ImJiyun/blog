"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createPost,
  updatePost,
  uploadImage,
  ALL_CATEGORIES,
} from "@/lib/api";
import type { Post, PostStatus } from "@/lib/api";
import styles from "./PostForm.module.css";
import MarkdownEditor from "./MarkdownEditor";

export default function PostForm({ initialPost }: { initialPost?: Post }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle ?? "");
  const [category, setCategory] = useState(initialPost?.category ?? ALL_CATEGORIES[0]);
  const [tagsText, setTagsText] = useState(initialPost?.tags.join(", ") ?? "");
  const [bodyMd, setBodyMd] = useState(initialPost?.bodyMd ?? "");
  const [isPublic, setIsPublic] = useState(initialPost?.isPublic ?? true);
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

  async function uploadAndInsertImages(files: File[], start: number, end: number) {
    setUploading(true);
    setError(null);
    let cursor = start;
    try {
      for (let i = 0; i < files.length; i++) {
        const { url } = await uploadImage(files[i]);
        const markdownImage = `${i === 0 ? "" : "\n"}![](${url})`;
        // Capture this iteration's slice bounds as locals (not the shared
        // `cursor`/`sliceEnd` closed over by reference) — setBodyMd's updater
        // callback is invoked by React later, after `cursor` below has
        // already been advanced for the next iteration. Closing over the
        // mutable outer variable let a later iteration's advanced cursor
        // leak into an earlier iteration's slice indices.
        const insertAt = cursor;
        const replaceEnd = i === 0 ? end : insertAt;
        setBodyMd((prev) => prev.slice(0, insertAt) + markdownImage + prev.slice(replaceEnd));
        cursor = insertAt + markdownImage.length;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      const finalCursor = cursor;
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(finalCursor, finalCursor);
        }
      });
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (uploading) return;
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (files.length === 0) return;
    event.preventDefault();
    uploadAndInsertImages(files, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
  }

  function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    if (uploading) return;
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length === 0) return;
    const start = event.currentTarget.selectionStart;
    const end = event.currentTarget.selectionEnd;
    uploadAndInsertImages(files, start, end);
  }

  function handleDragOver(event: DragEvent<HTMLTextAreaElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
  }

  async function handleSave(status: PostStatus) {
    setError(null);
    if (!title.trim() || !bodyMd.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    try {
      const input = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        bodyMd,
        category,
        tags: parseTags(),
        status,
        isPublic,
      };
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

      <div className={styles.fieldRow}>
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
          <span>Subtitle (optional)</span>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            data-testid="post-subtitle-input"
          />
        </label>
      </div>

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

      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        aria-label="공개 여부"
        onClick={() => setIsPublic((prev) => !prev)}
        className={isPublic ? `${styles.publishToggle} ${styles.publishToggleOn}` : styles.publishToggle}
        data-testid="post-public-toggle"
      >
        <span className={isPublic ? `${styles.publishDot} ${styles.publishDotOn}` : styles.publishDot} />
        {isPublic ? "공개" : "비공개"}
      </button>

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
        {uploading && <p className={styles.uploadStatus}>Uploading image(s)…</p>}
      </div>

      <div className={styles.bodyField}>
        <span className={styles.bodyLabel}>Body (Markdown)</span>
        <MarkdownEditor
          ref={textareaRef}
          value={bodyMd}
          onChange={setBodyMd}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          disabled={uploading}
        />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          disabled={saving}
          data-testid="cancel-button"
        >
          취소
        </button>
        <button type="button" onClick={() => handleSave("draft")} disabled={saving} data-testid="save-draft-button">
          임시 저장
        </button>
        <button type="button" onClick={() => handleSave("published")} disabled={saving} data-testid="publish-button">
          {isPublic ? "공개로 게시" : "비공개로 게시"}
        </button>
      </div>
    </form>
  );
}

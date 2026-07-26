"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { createComment } from "@/lib/api";
import type { Comment } from "@/lib/api";
import styles from "./CommentSection.module.css";

type Props = { postId: string; initialComments: Comment[] };

function buildTree(comments: Comment[]): Map<string | null, Comment[]> {
  const byParent = new Map<string | null, Comment[]>();
  for (const comment of comments) {
    const key = comment.parentCommentId;
    const list = byParent.get(key) ?? [];
    list.push(comment);
    byParent.set(key, list);
  }
  return byParent;
}

function CommentNode({
  comment,
  byParent,
  onReply,
}: {
  comment: Comment;
  byParent: Map<string | null, Comment[]>;
  onReply: (id: string) => void;
}) {
  const replies = byParent.get(comment.id) ?? [];
  return (
    <li className={styles.item}>
      <div className={styles.itemHeader}>
        <span className={styles.author}>{comment.authorName}</span>
        <span className={styles.date}>
          {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>
      <p className={styles.commentBody}>{comment.body}</p>
      <button
        type="button"
        className={styles.replyButton}
        onClick={() => onReply(comment.id)}
      >
        Reply
      </button>
      {replies.length > 0 && (
        <ul className={styles.replies}>
          {replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              byParent={byParent}
              onReply={onReply}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CommentSection({ postId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const byParent = buildTree(comments);
  const roots = byParent.get(null) ?? [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!authorName.trim() || !body.trim()) {
      setError("Name and comment are required.");
      return;
    }
    setSubmitting(true);
    try {
      const comment = await createComment(postId, {
        authorName: authorName.trim(),
        body: body.trim(),
        parentCommentId: replyTo ?? undefined,
      });
      setComments((prev) => [...prev, comment]);
      setAuthorName("");
      setBody("");
      setReplyTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.section} aria-label="Comments">
      <h2 className={styles.heading}>Comments ({comments.length})</h2>

      {roots.length === 0 ? (
        <p className={styles.empty}>No comments yet.</p>
      ) : (
        <ul className={styles.list}>
          {roots.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              byParent={byParent}
              onReply={setReplyTo}
            />
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={handleSubmit} data-testid="comment-form">
        {replyTo && (
          <div className={styles.replyingTo}>
            Replying to a comment.{" "}
            <button type="button" onClick={() => setReplyTo(null)}>
              Cancel
            </button>
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          data-testid="comment-author-input"
        />
        <textarea
          placeholder="Write a comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          data-testid="comment-body-input"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={submitting} data-testid="comment-submit">
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}

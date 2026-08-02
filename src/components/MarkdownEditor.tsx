"use client";

import { forwardRef } from "react";
import type { ClipboardEvent, DragEvent } from "react";
import MarkdownBody from "./MarkdownBody";
import styles from "./MarkdownEditor.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onDrop?: (event: DragEvent<HTMLTextAreaElement>) => void;
  onDragOver?: (event: DragEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
};

const MarkdownEditor = forwardRef<HTMLTextAreaElement, Props>(
  function MarkdownEditor(
    { value, onChange, onPaste, onDrop, onDragOver, disabled },
    ref,
  ) {
    return (
      <div className={styles.split}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
          onDrop={onDrop}
          onDragOver={onDragOver}
          readOnly={disabled}
          className={styles.textarea}
          aria-label="Body (Markdown)"
          data-testid="post-body-textarea"
        />
        <div className={styles.preview} data-testid="post-body-preview">
          {value.trim() ? (
            <MarkdownBody bodyMd={value} />
          ) : (
            <p className={styles.placeholder}>미리보기가 여기에 표시됩니다.</p>
          )}
        </div>
      </div>
    );
  },
);

export default MarkdownEditor;

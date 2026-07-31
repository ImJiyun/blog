"use client";

import { forwardRef } from "react";
import MarkdownBody from "./MarkdownBody";
import styles from "./MarkdownEditor.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const MarkdownEditor = forwardRef<HTMLTextAreaElement, Props>(
  function MarkdownEditor({ value, onChange }, ref) {
    return (
      <div className={styles.split}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.textarea}
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

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { isHighlightableInlineKeyword } from "@/lib/codeKeywords";
import styles from "./MarkdownBody.module.css";

function CodeRenderer({
  className,
  children,
  node: _node,
  ...props
}: ComponentPropsWithoutRef<"code"> & { node?: unknown }) {
  // Fenced/block code already carries a className (language-xxx and/or
  // hljs, added by remark/rehype-highlight) — leave it untouched, its
  // token coloring comes entirely from MarkdownBody.module.css.
  if (className) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  // Inline code (single backtick) never gets a className — rehype-highlight
  // skips it (no language class, and `detect` defaults to false). Only
  // highlight it when its full text is an exact keyword match, never on a
  // partial/substring match, so function calls like `Series.where()` are
  // left alone.
  const text = typeof children === "string" ? children : String(children);
  if (isHighlightableInlineKeyword(text)) {
    return (
      <code {...props}>
        <span className={styles.inlineKeyword}>{text}</span>
      </code>
    );
  }

  return <code {...props}>{children}</code>;
}

export default function MarkdownBody({ bodyMd }: { bodyMd: string }) {
  return (
    <div className={styles.body}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={{ code: CodeRenderer }}
      >
        {bodyMd}
      </ReactMarkdown>
    </div>
  );
}

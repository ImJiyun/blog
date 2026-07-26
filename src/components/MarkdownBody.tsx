import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import styles from "./MarkdownBody.module.css";

export default function MarkdownBody({ bodyMd }: { bodyMd: string }) {
  return (
    <div className={styles.body}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]}>
        {bodyMd}
      </ReactMarkdown>
    </div>
  );
}

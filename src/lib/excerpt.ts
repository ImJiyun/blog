const DEFAULT_MAX_LENGTH = 200;

// Strips common Markdown syntax down to plain text for use in contexts (RSS
// <description>, meta descriptions) that can't render Markdown/HTML. Not a full
// Markdown parser — just enough to avoid literal #/*/[]() characters leaking into
// plain-text output.
export function toExcerpt(bodyMd: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  const plain = bodyMd
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/^#{1,6}\s+/gm, "") // headers
    .replace(/[*_~]{1,3}/g, "") // bold/italic/strikethrough markers
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/\s+/g, " ") // collapse whitespace/newlines
    .trim();

  if (plain.length <= maxLength) return plain;

  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return `${cut}…`;
}

import GithubSlugger from "github-slugger";

export type Heading = { id: string; text: string; level: number };

const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;

// Walk every heading level (h1–h6), not just h2/h3, through one shared
// slugger — rehype-slug does the same across the whole rendered document, so
// running the slugger only over the filtered h2/h3 subset would let its
// occurrence-counter (for duplicate heading text) drift out of sync with the
// ids rehype-slug actually assigns in the DOM. Filter to h2/h3 after slugging
// so the returned ids still match what ScrollProgressBar/TableOfContents link to.
export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  HEADING_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HEADING_RE.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugger.slug(text);
    if (level === 2 || level === 3) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}

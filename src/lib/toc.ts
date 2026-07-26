import GithubSlugger from "github-slugger";

export type Heading = { id: string; text: string; level: number };

const HEADING_RE = /^(#{2,3})\s+(.+)$/gm;

export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  HEADING_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HEADING_RE.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugger.slug(text);
    headings.push({ id, text, level });
  }
  return headings;
}

const IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/;
const CODE_BLOCK_RE = /```[\s\S]*?```/g;

export function extractFirstImageUrl(bodyMd: string): string | null {
  const match = bodyMd.match(IMAGE_RE);
  return match ? match[1] : null;
}

export function computeReadMinutes(bodyMd: string, charsPerMinute = 500): number {
  const textOnly = bodyMd.replace(CODE_BLOCK_RE, "");
  return Math.max(1, Math.ceil(textOnly.length / charsPerMinute));
}

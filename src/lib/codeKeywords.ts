const INLINE_CODE_KEYWORDS = new Set<string>([
  // Python
  "if",
  "elif",
  "else",
  "for",
  "while",
  "def",
  "return",
  "import",
  "from",
  "class",
  "try",
  "except",
  "finally",
  "with",
  "lambda",
  "yield",
  // SQL
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "GROUP BY",
  "ORDER BY",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
]);

export function isHighlightableInlineKeyword(text: string): boolean {
  return INLINE_CODE_KEYWORDS.has(text);
}

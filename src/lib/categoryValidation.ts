export const VALID_SECTIONS = ["data", "dev", "life"] as const;

export function isValidSection(value: unknown): value is (typeof VALID_SECTIONS)[number] | null {
  return (
    value === null ||
    (typeof value === "string" && (VALID_SECTIONS as readonly string[]).includes(value))
  );
}

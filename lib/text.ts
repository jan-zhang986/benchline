/** Collapse whitespace and strip control characters. Safe for form fields. */
export function cleanText(input: string, max: number): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Normalizes a feature slug to kebab-case (lowercase, hyphen-separated).
 */
export function toKebabCase(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function padFeatureIndex(n: number): string {
  if (n < 1 || n > 999) {
    throw new Error(`Feature index must be 1–999, got ${n}`);
  }
  return String(n).padStart(3, "0");
}

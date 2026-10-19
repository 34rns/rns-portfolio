export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ensureUniqueSlug(base: string, taken: Iterable<string>): string {
  const existing = new Set(taken);
  const root = slugify(base) || "project";
  if (!existing.has(root)) return root;

  let suffix = 2;
  while (existing.has(`${root}-${suffix}`)) suffix += 1;
  return `${root}-${suffix}`;
}

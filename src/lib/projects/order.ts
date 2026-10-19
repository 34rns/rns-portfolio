export type MoveDirection = "up" | "down";

/**
 * Swap a project with its neighbour. Pure so the admin reorder can be tested
 * without a database.
 */
export function computeReorder(ids: string[], id: string, direction: MoveDirection): string[] {
  const index = ids.indexOf(id);
  if (index === -1) return ids;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= ids.length) return ids;

  const next = [...ids];
  const current = next[index];
  next[index] = next[target];
  next[target] = current;
  return next;
}

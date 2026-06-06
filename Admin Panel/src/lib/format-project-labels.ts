export function buildProjectNameMap(
  projects: { id: number; name?: string | null }[]
): Map<number, string> {
  const map = new Map<number, string>();
  for (const p of projects) {
    const label = String(p.name ?? "").trim();
    map.set(p.id, label || `Project #${p.id}`);
  }
  return map;
}

export function formatProjectIdsAsNames(
  ids: unknown,
  nameById: Map<number, string>
): string {
  const list = Array.isArray(ids) ? ids : [];
  if (!list.length) return "—";

  const names = list
    .map((id) => nameById.get(Number(id)))
    .filter((name): name is string => Boolean(name));

  return names.length ? names.join(", ") : "—";
}

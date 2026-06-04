/** Map module id → display name for tables and labels */
export function buildModuleNameMap(
  modules: { id: number; module_name?: string | null }[]
): Map<number, string> {
  const map = new Map<number, string>();
  for (const m of modules) {
    const label = String(m.module_name ?? "").trim();
    map.set(m.id, label || `Module #${m.id}`);
  }
  return map;
}

/** e.g. [1, 2] → "hello, hii" */
export function formatModuleIdsAsNames(
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

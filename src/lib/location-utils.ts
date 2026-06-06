import type { Truck, Site } from "./database.types";

export function locationLabel(
  type: string,
  id: string | null,
  trucks: Pick<Truck, "id" | "number" | "name">[],
  sites: Pick<Site, "id" | "name">[]
): string {
  if (type === "Office") return "Office";
  if (type === "Truck") {
    const t = trucks.find((t) => t.id === id);
    return t ? `Truck ${t.number} — ${t.name}` : "Truck";
  }
  const s = sites.find((s) => s.id === id);
  return s ? `Site: ${s.name}` : "Site";
}

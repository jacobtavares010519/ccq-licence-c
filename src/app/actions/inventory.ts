import * as db from "@/lib/db";
import type { ItemCategory, ItemCondition, LocationType, MovementAction } from "@/lib/database.types";

type R = Promise<{ error?: string; success?: boolean }>;

export async function createItem(formData: FormData): R {
  db.createItem({
    name: formData.get("name") as string,
    category: formData.get("category") as ItemCategory,
    condition: (formData.get("condition") as ItemCondition) || null,
    supplier: (formData.get("supplier") as string) || null,
    supplier_ref: (formData.get("supplier_ref") as string) || null,
    min_qty: parseFloat((formData.get("min_qty") as string) || "0"),
  });
  return { success: true };
}

export async function updateItem(id: string, formData: FormData): R {
  db.updateItem(id, {
    name: formData.get("name") as string,
    category: formData.get("category") as ItemCategory,
    condition: (formData.get("condition") as ItemCondition) || null,
    supplier: (formData.get("supplier") as string) || null,
    supplier_ref: (formData.get("supplier_ref") as string) || null,
    min_qty: parseFloat((formData.get("min_qty") as string) || "0"),
  });
  return { success: true };
}

export async function deleteItem(id: string): R {
  db.deleteItem(id);
  return { success: true };
}

export async function recordMovement(data: {
  item_id: string;
  action: MovementAction;
  from_loc_type?: LocationType;
  from_loc_id?: string | null;
  to_loc_type?: LocationType;
  to_loc_id?: string | null;
  quantity: number;
  date: string;
  notes?: string;
}): R {
  return db.recordMovement(data);
}

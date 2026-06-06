"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ItemCategory, ItemCondition, LocationType, MovementAction } from "@/lib/database.types";

// ── Items ─────────────────────────────────────────────────────────────────────

export async function createItem(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").insert({
    name: formData.get("name") as string,
    category: formData.get("category") as ItemCategory,
    condition: (formData.get("condition") as ItemCondition) || null,
    supplier: (formData.get("supplier") as string) || null,
    supplier_ref: (formData.get("supplier_ref") as string) || null,
    min_qty: parseFloat((formData.get("min_qty") as string) || "0"),
  });
  if (error) return { error: error.message };
  revalidatePath("/inventory");
  return { success: true };
}

export async function updateItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .update({
      name: formData.get("name") as string,
      category: formData.get("category") as ItemCategory,
      condition: (formData.get("condition") as ItemCondition) || null,
      supplier: (formData.get("supplier") as string) || null,
      supplier_ref: (formData.get("supplier_ref") as string) || null,
      min_qty: parseFloat((formData.get("min_qty") as string) || "0"),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  return { success: true };
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/inventory");
  return { success: true };
}

// ── Movements ─────────────────────────────────────────────────────────────────

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
}) {
  const supabase = await createClient();

  // Insert movement record
  const { error: moveError } = await supabase
    .from("inventory_movements")
    .insert({
      item_id: data.item_id,
      action: data.action,
      from_loc_type: data.from_loc_type || null,
      from_loc_id: data.from_loc_id || null,
      to_loc_type: data.to_loc_type || null,
      to_loc_id: data.to_loc_id || null,
      quantity: data.quantity,
      date: data.date,
      notes: data.notes || null,
    });
  if (moveError) return { error: moveError.message };

  // Update item_locations
  if (data.from_loc_type) {
    await adjustLocationQty(
      supabase,
      data.item_id,
      data.from_loc_type,
      data.from_loc_id ?? null,
      -data.quantity
    );
  }
  if (data.to_loc_type) {
    await adjustLocationQty(
      supabase,
      data.item_id,
      data.to_loc_type,
      data.to_loc_id ?? null,
      data.quantity
    );
  }

  revalidatePath("/inventory");
  if (data.from_loc_id) revalidatePath(`/inventory/${data.item_id}`);
  return { success: true };
}

async function adjustLocationQty(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  item_id: string,
  location_type: LocationType,
  location_id: string | null,
  delta: number
) {
  const query = supabase
    .from("item_locations")
    .select("id, quantity")
    .eq("item_id", item_id)
    .eq("location_type", location_type);

  if (location_id) {
    query.eq("location_id", location_id);
  } else {
    query.is("location_id", null);
  }

  const { data: existing } = await query.single();

  if (existing) {
    await supabase
      .from("item_locations")
      .update({ quantity: existing.quantity + delta, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("item_locations").insert({
      item_id,
      location_type,
      location_id: location_id || null,
      quantity: delta,
    });
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
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
  if (data.quantity <= 0) {
    return { error: "Quantity must be greater than zero." };
  }

  const supabase = await createClient();

  // For Transfer and Consume, verify source has sufficient stock
  if (data.from_loc_type) {
    const available = await getLocationQty(
      supabase,
      data.item_id,
      data.from_loc_type,
      data.from_loc_id ?? null
    );
    if (available < data.quantity) {
      return {
        error: `Insufficient stock at source. Available: ${available}, requested: ${data.quantity}.`,
      };
    }
  }

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
    const err = await adjustLocationQty(
      supabase,
      data.item_id,
      data.from_loc_type,
      data.from_loc_id ?? null,
      -data.quantity
    );
    if (err) return { error: err };
  }
  if (data.to_loc_type) {
    const err = await adjustLocationQty(
      supabase,
      data.item_id,
      data.to_loc_type,
      data.to_loc_id ?? null,
      data.quantity
    );
    if (err) return { error: err };
  }

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${data.item_id}`);
  return { success: true };
}

async function getLocationQty(
  supabase: SupabaseClient,
  item_id: string,
  location_type: LocationType,
  location_id: string | null
): Promise<number> {
  let query = supabase
    .from("item_locations")
    .select("quantity")
    .eq("item_id", item_id)
    .eq("location_type", location_type);

  query = location_id
    ? query.eq("location_id", location_id)
    : query.is("location_id", null);

  const { data } = await query.maybeSingle();
  return (data as { quantity: number } | null)?.quantity ?? 0;
}

// Returns an error string on failure, null on success.
async function adjustLocationQty(
  supabase: SupabaseClient,
  item_id: string,
  location_type: LocationType,
  location_id: string | null,
  delta: number
): Promise<string | null> {
  // Build query with proper reassignment on each chain call
  let query = supabase
    .from("item_locations")
    .select("id, quantity")
    .eq("item_id", item_id)
    .eq("location_type", location_type);

  query = location_id
    ? query.eq("location_id", location_id)
    : query.is("location_id", null);

  const { data: existing, error: fetchError } = await query.maybeSingle();
  if (fetchError) return fetchError.message;

  if (existing) {
    const { error } = await supabase
      .from("item_locations")
      .update({
        quantity: (existing as { id: string; quantity: number }).quantity + delta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (existing as { id: string; quantity: number }).id);
    if (error) return error.message;
  } else {
    const { error } = await supabase.from("item_locations").insert({
      item_id,
      location_type,
      location_id: location_id || null,
      quantity: delta,
    });
    if (error) return error.message;
  }

  return null;
}

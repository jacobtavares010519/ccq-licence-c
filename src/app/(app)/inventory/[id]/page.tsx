import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ItemDetail } from "@/components/inventory/item-detail";
import type { Item, ItemLocation, InventoryMovement, Truck, Site } from "@/lib/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  const supabase = await createClient();

  const [itemRes, locationsRes, movementsRes, trucksRes, sitesRes] = await Promise.all([
    supabase.from("items").select("*").eq("id", id).single(),
    supabase.from("item_locations").select("*").eq("item_id", id),
    supabase
      .from("inventory_movements")
      .select("*")
      .eq("item_id", id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("trucks").select("*").order("number"),
    supabase.from("sites").select("*").order("name"),
  ]);

  if (itemRes.error || !itemRes.data) return null;

  return {
    item: itemRes.data as Item,
    locations: (locationsRes.data || []) as ItemLocation[],
    movements: (movementsRes.data || []) as InventoryMovement[],
    trucks: (trucksRes.data || []) as Truck[],
    sites: (sitesRes.data || []) as Site[],
  };
}

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  return (
    <AppShell title={data.item.name}>
      <div className="max-w-3xl mx-auto">
        <ItemDetail {...data} />
      </div>
    </AppShell>
  );
}

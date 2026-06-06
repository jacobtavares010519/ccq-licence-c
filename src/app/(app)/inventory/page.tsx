import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { LowStockBanner } from "@/components/inventory/low-stock-banner";
import { InventoryList } from "@/components/inventory/inventory-list";
import type { ItemWithLocations, Item, ItemLocation, Truck, Site } from "@/lib/database.types";

async function getData() {
  const supabase = await createClient();

  const [itemsRes, locationsRes, trucksRes, sitesRes] = await Promise.all([
    supabase.from("items").select("*").order("name"),
    supabase.from("item_locations").select("*"),
    supabase.from("trucks").select("*").order("number"),
    supabase.from("sites").select("*").order("name"),
  ]);

  const items: Item[] = itemsRes.data || [];
  const locations: ItemLocation[] = locationsRes.data || [];
  const trucks: Truck[] = trucksRes.data || [];
  const sites: Site[] = sitesRes.data || [];

  const enriched: ItemWithLocations[] = items.map((item) => {
    const itemLocs = locations.filter((l) => l.item_id === item.id);
    const total = itemLocs.reduce((sum, l) => sum + l.quantity, 0);
    return {
      ...item,
      item_locations: itemLocs,
      total_quantity: total,
      is_low_stock: item.category === "Consumable" && total <= item.min_qty,
    };
  });

  return { items: enriched, trucks, sites };
}

export default async function InventoryPage() {
  const { items, trucks, sites } = await getData();

  return (
    <AppShell title="Inventory">
      <div className="space-y-4 max-w-5xl mx-auto">
        <LowStockBanner items={items} />
        <InventoryList items={items} trucks={trucks} sites={sites} />
      </div>
    </AppShell>
  );
}

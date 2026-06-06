"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LowStockBanner } from "@/components/inventory/low-stock-banner";
import { InventoryList } from "@/components/inventory/inventory-list";
import * as db from "@/lib/db";
import type { ItemWithLocations, Truck, Site } from "@/lib/database.types";

export default function InventoryPage() {
  const [items, setItems] = useState<ItemWithLocations[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const load = useCallback(() => {
    const rawItems = db.getItems();
    const locations = db.getItemLocations();
    const enriched: ItemWithLocations[] = rawItems.map((item) => {
      const itemLocs = locations.filter((l) => l.item_id === item.id);
      const total = itemLocs.reduce((sum, l) => sum + l.quantity, 0);
      return { ...item, item_locations: itemLocs, total_quantity: total, is_low_stock: item.category === "Consumable" && total <= item.min_qty };
    });
    setItems(enriched);
    setTrucks(db.getTrucks());
    setSites(db.getSites());
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppShell title="Inventory">
      <div className="space-y-4 max-w-5xl mx-auto">
        <LowStockBanner items={items} />
        <InventoryList items={items} trucks={trucks} sites={sites} onRefresh={load} />
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ItemDetail } from "@/components/inventory/item-detail";
import * as db from "@/lib/db";
import type { Item, ItemLocation, InventoryMovement, Truck, Site } from "@/lib/database.types";

export function ItemDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<{
    item: Item;
    locations: ItemLocation[];
    movements: InventoryMovement[];
    trucks: Truck[];
    sites: Site[];
  } | null>(null);

  const load = () => {
    const item = db.getItem(id);
    if (!item) { router.replace("/inventory"); return; }
    setData({
      item,
      locations: db.getItemLocations().filter((l) => l.item_id === id),
      movements: db.getMovements(id).slice(0, 50),
      trucks: db.getTrucks(),
      sites: db.getSites(),
    });
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return null;

  return (
    <AppShell title={data.item.name}>
      <div className="max-w-3xl mx-auto">
        <ItemDetail {...data} onRefresh={load} />
      </div>
    </AppShell>
  );
}

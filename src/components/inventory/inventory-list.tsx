"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Package, Wrench, Zap, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemForm } from "./item-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ItemWithLocations, Truck, Site, ItemCategory } from "@/lib/database.types";
import { locationLabel } from "@/lib/location-utils";

interface InventoryListProps {
  items: ItemWithLocations[];
  trucks: Truck[];
  sites: Site[];
}

const categoryIcons: Record<ItemCategory, React.ElementType> = {
  Tool: Wrench,
  Equipment: Zap,
  Consumable: Package,
};

const conditionColors: Record<string, string> = {
  Good: "success",
  NeedsRepair: "warning",
  Retired: "secondary",
};

export function InventoryList({ items, trucks, sites }: InventoryListProps) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "all" || item.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const lowStock = filtered.filter((i) => i.is_low_stock);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Tool">Tools</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Consumable">Consumables</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Item</DialogTitle>
            </DialogHeader>
            <ItemForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="lowstock">
            Low Stock ({lowStock.length})
            {lowStock.length > 0 && (
              <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                {lowStock.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ItemGrid items={filtered} trucks={trucks} sites={sites} />
        </TabsContent>
        <TabsContent value="lowstock">
          <ItemGrid items={lowStock} trucks={trucks} sites={sites} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ItemGrid({ items, trucks, sites }: { items: ItemWithLocations[]; trucks: Truck[]; sites: Site[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Package className="h-10 w-10 opacity-30" />
        <p className="text-sm">No items found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = categoryIcons[item.category];
        return (
          <Link
            key={item.id}
            href={`/inventory/${item.id}`}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-sm hover:border-[#F59E0B] hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-4 w-4 text-[#F59E0B] shrink-0" />
                <span className="font-medium text-[#0F172A] truncate">{item.name}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                {item.is_low_stock && (
                  <TriangleAlert className="h-4 w-4 text-amber-500" />
                )}
                {item.condition && (
                  <Badge variant={conditionColors[item.condition] as "success" | "warning" | "secondary"}>
                    {item.condition}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.category}</span>
              <span className={`font-semibold ${item.is_low_stock ? "text-amber-600" : "text-[#0F172A]"}`}>
                Qty: {item.total_quantity}
              </span>
            </div>

            {item.item_locations.filter(l => l.quantity > 0).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.item_locations
                  .filter((l) => l.quantity > 0)
                  .map((loc) => (
                    <span
                      key={loc.id}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {locationLabel(loc.location_type, loc.location_id, trucks, sites)}: {loc.quantity}
                    </span>
                  ))}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

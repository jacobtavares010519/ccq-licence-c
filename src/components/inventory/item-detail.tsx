"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ItemForm } from "./item-form";
import { MovementForm } from "./movement-form";
import { ErrorAlert } from "@/components/ui/error-alert";
import { deleteItem } from "@/app/actions/inventory";
import type { Item, ItemLocation, InventoryMovement, Truck, Site } from "@/lib/database.types";
import { locationLabel } from "@/lib/location-utils";

interface ItemDetailProps {
  item: Item;
  locations: ItemLocation[];
  movements: InventoryMovement[];
  trucks: Truck[];
  sites: Site[];
  onRefresh?: () => void;
}

const conditionVariant: Record<string, "success" | "warning" | "secondary"> = {
  Good: "success",
  NeedsRepair: "warning",
  Retired: "secondary",
};

const actionColors: Record<string, string> = {
  Receive: "text-green-700",
  Transfer: "text-blue-700",
  Consume: "text-red-700",
};

export function ItemDetail({ item, locations, movements, trucks, sites, onRefresh }: ItemDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalQty = locations.reduce((sum, l) => sum + l.quantity, 0);
  const isLowStock = item.category === "Consumable" && totalQty <= item.min_qty;

  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteItem(item.id);
      if (result?.error) {
        setDeleteError(result.error);
      } else {
        router.push("/inventory");
      }
    });
  }

  return (
    <div className="space-y-4">
      {deleteError && <ErrorAlert message={deleteError} />}
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/inventory" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Inventory
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMoveOpen(true)}>
            <ArrowRightLeft className="h-4 w-4" /> Move
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl">{item.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{item.category}</Badge>
              {item.condition && (
                <Badge variant={conditionVariant[item.condition]}>{item.condition}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.supplier && (
              <div>
                <span className="text-muted-foreground">Supplier</span>
                <p className="font-medium">{item.supplier}</p>
              </div>
            )}
            {item.supplier_ref && (
              <div>
                <span className="text-muted-foreground">Ref</span>
                <p className="font-medium">{item.supplier_ref}</p>
              </div>
            )}
            {item.category === "Consumable" && (
              <div>
                <span className="text-muted-foreground">Min Qty</span>
                <p className="font-medium">{item.min_qty}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Quantity by location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Stock by Location</span>
              <span className={`text-sm font-bold ${isLowStock ? "text-amber-600" : "text-[#0F172A]"}`}>
                Total: {totalQty}
              </span>
            </div>
            {locations.filter((l) => l.quantity > 0).length === 0 ? (
              <p className="text-sm text-muted-foreground">No stock recorded</p>
            ) : (
              <div className="space-y-1">
                {locations
                  .filter((l) => l.quantity > 0)
                  .map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                      <span>{locationLabel(loc.location_type, loc.location_id, trucks, sites)}</span>
                      <span className="font-semibold">{loc.quantity}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Movement History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No movements recorded</p>
          ) : (
            <div className="space-y-2">
              {movements.map((m) => (
                <div key={m.id} className="flex flex-col gap-0.5 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-semibold ${actionColors[m.action]}`}>{m.action}</span>
                    <span className="text-muted-foreground">{m.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {m.from_loc_type && (
                        <>{locationLabel(m.from_loc_type, m.from_loc_id, trucks, sites)} → </>
                      )}
                      {m.to_loc_type && locationLabel(m.to_loc_type, m.to_loc_id, trucks, sites)}
                    </span>
                    <span className="font-medium text-sm text-foreground">×{m.quantity}</span>
                  </div>
                  {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemForm item={item} onSuccess={() => { setEditOpen(false); onRefresh?.(); }} />
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Movement — {item.name}</DialogTitle>
          </DialogHeader>
          <MovementForm item={item} trucks={trucks} sites={sites} onSuccess={() => { setMoveOpen(false); onRefresh?.(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

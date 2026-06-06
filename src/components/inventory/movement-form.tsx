"use client";

import { useState, useTransition } from "react";
import { recordMovement } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import type { Item, Truck, Site, LocationType, MovementAction } from "@/lib/database.types";

interface MovementFormProps {
  item: Item;
  trucks: Truck[];
  sites: Site[];
  onSuccess?: () => void;
  defaultAction?: MovementAction;
}

type LocationOption = { type: LocationType; id: string | null; label: string };

function buildLocationOptions(trucks: Truck[], sites: Site[]): LocationOption[] {
  return [
    { type: "Office", id: null, label: "Office" },
    ...trucks.map((t) => ({ type: "Truck" as LocationType, id: t.id, label: `Truck ${t.number} — ${t.name}` })),
    ...sites.filter((s) => s.status === "Active").map((s) => ({ type: "Site" as LocationType, id: s.id, label: `Site: ${s.name}` })),
  ];
}

function locationKey(opt: LocationOption) {
  return `${opt.type}::${opt.id ?? ""}`;
}

export function MovementForm({ item, trucks, sites, onSuccess, defaultAction = "Receive" }: MovementFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<MovementAction>(defaultAction);
  const [fromKey, setFromKey] = useState<string>("");
  const [toKey, setToKey] = useState<string>("");

  const locationOptions = buildLocationOptions(trucks, sites);
  const today = new Date().toISOString().split("T")[0];

  function parseKey(key: string): { type: LocationType; id: string | null } | null {
    if (!key) return null;
    const [type, id] = key.split("::");
    return { type: type as LocationType, id: id || null };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const qty = parseFloat(fd.get("quantity") as string);
    const date = fd.get("date") as string;
    const notes = fd.get("notes") as string;

    const from = parseKey(fromKey);
    const to = parseKey(toKey);

    if (action === "Transfer" && (!from || !to)) {
      setError("Both source and destination are required for a transfer.");
      return;
    }
    if (action === "Receive" && !to) {
      setError("Destination is required for Receive.");
      return;
    }
    if (action === "Consume" && !from) {
      setError("Source location is required for Consume.");
      return;
    }

    startTransition(async () => {
      const result = await recordMovement({
        item_id: item.id,
        action,
        from_loc_type: from?.type,
        from_loc_id: from?.id ?? undefined,
        to_loc_type: to?.type,
        to_loc_id: to?.id ?? undefined,
        quantity: qty,
        date,
        notes: notes || undefined,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Action */}
      <div className="space-y-2">
        <Label>Action *</Label>
        <Select value={action} onValueChange={(v) => setAction(v as MovementAction)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Receive">Receive (stock in)</SelectItem>
            <SelectItem value="Transfer">Transfer</SelectItem>
            <SelectItem value="Consume">Consume (stock out)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* From location */}
      {(action === "Transfer" || action === "Consume") && (
        <div className="space-y-2">
          <Label>From *</Label>
          <Select value={fromKey} onValueChange={setFromKey}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((opt) => (
                <SelectItem key={locationKey(opt)} value={locationKey(opt)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* To location */}
      {(action === "Transfer" || action === "Receive") && (
        <div className="space-y-2">
          <Label>To *</Label>
          <Select value={toKey} onValueChange={setToKey}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((opt) => (
                <SelectItem key={locationKey(opt)} value={locationKey(opt)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input id="quantity" name="quantity" type="number" min="0.01" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" name="date" type="date" defaultValue={today} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} placeholder="Optional" />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Recording…" : "Record Movement"}
      </Button>
    </form>
  );
}

"use client";
import { ErrorAlert } from "@/components/ui/error-alert";

import { useState, useTransition } from "react";
import { createItem, updateItem } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Item, ItemCategory, ItemCondition } from "@/lib/database.types";

interface ItemFormProps {
  item?: Item;
  onSuccess?: () => void;
}

const CATEGORIES: ItemCategory[] = ["Tool", "Equipment", "Consumable"];
const CONDITIONS: ItemCondition[] = ["Good", "NeedsRepair", "Retired"];

export function ItemForm({ item, onSuccess }: ItemFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<string>(item?.category || "Consumable");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);

    startTransition(async () => {
      const result = item
        ? await updateItem(item.id, formData)
        : await createItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    });
  }

  const needsCondition = category === "Tool" || category === "Equipment";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={item?.name} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {needsCondition && (
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select name="condition" defaultValue={item?.condition || "Good"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" name="supplier" defaultValue={item?.supplier || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier_ref">Supplier Ref</Label>
          <Input id="supplier_ref" name="supplier_ref" defaultValue={item?.supplier_ref || ""} />
        </div>
      </div>

      {category === "Consumable" && (
        <div className="space-y-2">
          <Label htmlFor="min_qty">Min Quantity (low-stock alert)</Label>
          <Input
            id="min_qty"
            name="min_qty"
            type="number"
            min="0"
            step="1"
            defaultValue={item?.min_qty ?? 0}
          />
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : item ? "Update Item" : "Add Item"}
      </Button>
    </form>
  );
}

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { ItemWithLocations } from "@/lib/database.types";

interface LowStockBannerProps {
  items: ItemWithLocations[];
}

export function LowStockBanner({ items }: LowStockBannerProps) {
  const lowStock = items.filter((i) => i.is_low_stock);
  if (lowStock.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-amber-800">Low Stock Alert</p>
        <ul className="mt-1 space-y-0.5 text-amber-700">
          {lowStock.map((item) => (
            <li key={item.id}>
              <Link href={`/inventory/${item.id}`} className="hover:underline">
                {item.name}
              </Link>
              {" — "}
              {item.total_quantity} / {item.min_qty} min
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

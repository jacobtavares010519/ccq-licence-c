"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteForm } from "./site-form";
import type { Site, SiteStatus } from "@/lib/database.types";

const statusVariant: Record<SiteStatus, "success" | "warning" | "secondary"> = {
  Active: "success",
  Completed: "secondary",
  OnHold: "warning",
};

export function SitesList({ sites, onRefresh }: { sites: Site[]; onRefresh?: () => void }) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.client || "").toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter((s) => s.status === "Active");
  const other = filtered.filter((s) => s.status !== "Active");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sites…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Site
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Job Site</DialogTitle>
            </DialogHeader>
            <SiteForm onSuccess={() => { setAddOpen(false); onRefresh?.(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <MapPin className="h-10 w-10 opacity-30" />
          <p className="text-sm">No sites found</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Active ({active.length})
              </h2>
              <SiteGrid sites={active} />
            </section>
          )}
          {other.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Other
              </h2>
              <SiteGrid sites={other} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SiteGrid({ sites }: { sites: Site[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sites.map((site) => (
        <Link
          key={site.id}
          href={`/sites/${site.id}`}
          className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4 shadow-sm hover:border-[#F59E0B] hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-[#F59E0B] shrink-0" />
              <span className="font-semibold text-[#0F172A] truncate">{site.name}</span>
            </div>
            <Badge variant={statusVariant[site.status]}>{site.status}</Badge>
          </div>
          {site.client && <p className="text-sm text-muted-foreground">{site.client}</p>}
          {site.address && <p className="text-xs text-slate-400 truncate">{site.address}</p>}
          {site.start_date && (
            <p className="text-xs text-muted-foreground">
              {site.start_date}{site.end_date ? ` → ${site.end_date}` : ""}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

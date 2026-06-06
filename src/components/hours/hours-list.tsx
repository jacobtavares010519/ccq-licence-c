"use client";

import { useState } from "react";
import { Plus, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HoursForm } from "./hours-form";
import { deleteHours } from "@/app/actions/hours";
import type { Employee, Site } from "@/lib/database.types";

interface HoursRow {
  id: string;
  employee_id: string;
  site_id: string;
  date: string;
  hours: number;
  notes: string | null;
  employees: { name: string } | null;
  sites: { name: string } | null;
}

interface HoursListProps {
  hours: unknown[];
  employees: Employee[];
  sites: Site[];
}

function groupByDate(hours: HoursRow[]): [string, HoursRow[]][] {
  const map = new Map<string, HoursRow[]>();
  for (const h of hours) {
    const list = map.get(h.date) || [];
    list.push(h);
    map.set(h.date, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export function HoursList({ hours, employees, sites }: HoursListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const rows = hours as HoursRow[];
  const grouped = groupByDate(rows);
  const totalThisWeek = calcWeekHours(rows);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await deleteHours(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          This week: <span className="font-bold text-[#0F172A] text-base">{totalThisWeek}h</span>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Log Hours
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Hours</DialogTitle>
            </DialogHeader>
            <HoursForm employees={employees} sites={sites} onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Clock className="h-10 w-10 opacity-30" />
          <p className="text-sm">No hours logged yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, entries]) => {
            const dayTotal = entries.reduce((s, h) => s + h.hours, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">{formatDate(date)}</h3>
                  <span className="text-sm font-bold text-[#0F172A]">{dayTotal}h</span>
                </div>
                <div className="space-y-2">
                  {entries.map((h) => (
                    <Card key={h.id}>
                      <CardContent className="p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">{h.employees?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{h.sites?.name ?? "—"}</p>
                          {h.notes && <p className="text-xs text-slate-400">{h.notes}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#0F172A]">{h.hours}h</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-400 hover:text-red-600"
                            onClick={() => handleDelete(h.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function calcWeekHours(hours: HoursRow[]) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  monday.setHours(0, 0, 0, 0);

  return hours
    .filter((h) => new Date(h.date + "T12:00:00") >= monday)
    .reduce((sum, h) => sum + h.hours, 0);
}

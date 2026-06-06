"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HoursRow {
  id: string;
  date: string;
  hours: number;
  employees: { name: string } | null;
  sites: { name: string } | null;
}

interface TaskRow {
  id: string;
  due_date: string | null;
  title: string;
  status: string;
  sites: { name: string } | null;
  employees: { name: string } | null;
}

interface CalendarViewProps {
  hours: unknown[];
  tasks: unknown[];
  sites: unknown[];
  employees: unknown[];
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ hours, tasks }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(today.toISOString().split("T")[0]);

  const hoursRows = hours as HoursRow[];
  const taskRows = tasks as TaskRow[];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDow = (startOfMonth(year, month).getDay() + 6) % 7; // Mon=0
  const numDays = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedHours = selected ? hoursRows.filter((h) => h.date === selected) : [];
  const selectedTasks = selected
    ? taskRows.filter((t) => t.due_date === selected)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          {new Date(year, month).toLocaleString("en-CA", { month: "long", year: "numeric" })}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="h-16 border-b border-r border-border last:border-r-0" />;
            }
            const ds = dateStr(day);
            const dayHours = hoursRows.filter((h) => h.date === ds);
            const dayTasks = taskRows.filter((t) => t.due_date === ds);
            const isToday = ds === today.toISOString().split("T")[0];
            const isSelected = ds === selected;
            const totalH = dayHours.reduce((s, h) => s + h.hours, 0);

            return (
              <button
                key={ds}
                onClick={() => setSelected(ds)}
                className={cn(
                  "h-16 border-b border-r border-border last:border-r-0 p-1 text-left transition-colors hover:bg-slate-50",
                  isSelected && "bg-amber-50 border-amber-200",
                  (i + 1) % 7 === 0 && "border-r-0"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday && "bg-[#0F172A] text-white",
                    !isToday && "text-foreground"
                  )}
                >
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {totalH > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] text-blue-600 font-medium">
                      <Clock className="h-2.5 w-2.5" /> {totalH}h
                    </div>
                  )}
                  {dayTasks.length > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                      <CheckSquare className="h-2.5 w-2.5" /> {dayTasks.length}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day panel */}
      {selected && (selectedHours.length > 0 || selectedTasks.length > 0) && (
        <div className="rounded-lg border border-border bg-white p-4 space-y-4">
          <h3 className="font-semibold text-[#0F172A]">
            {new Date(selected + "T12:00:00").toLocaleDateString("en-CA", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </h3>
          {selectedHours.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hours</p>
              <div className="space-y-1">
                {selectedHours.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-sm rounded-md bg-blue-50 px-3 py-2">
                    <span>{h.employees?.name ?? "—"}</span>
                    <span className="text-muted-foreground">{h.sites?.name ?? "—"}</span>
                    <span className="font-bold">{h.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedTasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Due Tasks</p>
              <div className="space-y-1">
                {selectedTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm rounded-md bg-amber-50 px-3 py-2">
                    <span className="font-medium">{t.title}</span>
                    <span className="text-muted-foreground">{t.sites?.name}</span>
                    <Badge variant={t.status === "InProgress" ? "warning" : "default"}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

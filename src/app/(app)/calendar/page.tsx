"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/calendar/calendar-view";
import * as db from "@/lib/db";

export default function CalendarPage() {
  const [data, setData] = useState<{
    hours: unknown[];
    tasks: unknown[];
    sites: unknown[];
    employees: unknown[];
    initialYear: number;
    initialMonth: number;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    const allSites = db.getSites();
    const allEmployees = db.getEmployees();
    const allHours = db.getHours();
    const allTasks = db.getTasks();

    const hours = allHours.map((h) => ({
      ...h,
      employees: { name: allEmployees.find((e) => e.id === h.employee_id)?.name ?? "" },
      sites: { name: allSites.find((s) => s.id === h.site_id)?.name ?? "" },
    }));
    const tasks = allTasks
      .filter((t) => t.status !== "Done" && t.due_date)
      .map((t) => ({
        ...t,
        sites: { name: allSites.find((s) => s.id === t.site_id)?.name ?? "" },
        employees: t.employee_id ? { name: allEmployees.find((e) => e.id === t.employee_id)?.name ?? "" } : null,
      }));

    setData({
      hours,
      tasks,
      sites: allSites.filter((s) => s.status === "Active"),
      employees: allEmployees.filter((e) => e.status === "Active"),
      initialYear: now.getFullYear(),
      initialMonth: now.getMonth(),
    });
  }, []);

  if (!data) return null;

  return (
    <AppShell title="Calendar">
      <CalendarView {...data} />
    </AppShell>
  );
}

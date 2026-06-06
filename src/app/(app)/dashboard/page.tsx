"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Dashboard } from "@/components/dashboard/dashboard";
import * as db from "@/lib/db";

export default function DashboardPage() {
  const [data, setData] = useState<{
    activeSiteCount: number;
    openTaskCount: number;
    hoursThisWeek: number;
    lowStockCount: number;
    recentTasks: unknown[];
    recentMovements: unknown[];
    activeSites: unknown[];
    lowStockItems: unknown[];
  } | null>(null);

  useEffect(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const mondayStr = monday.toISOString().split("T")[0];

    const sites = db.getSites();
    const tasks = db.getTasks();
    const hours = db.getHours();
    const items = db.getItems();
    const locations = db.getItemLocations();
    const movements = db.getMovements().slice(0, 5);
    const trucks = db.getTrucks();
    const employees = db.getEmployees();

    const activeSites = sites.filter((s) => s.status === "Active");
    const openTasks = tasks.filter((t) => t.status !== "Done");
    const hoursThisWeek = hours
      .filter((h) => h.date >= mondayStr)
      .reduce((sum, h) => sum + h.hours, 0);

    const lowStockItems = items.filter((item) => {
      if (item.category !== "Consumable") return false;
      const total = locations.filter((l) => l.item_id === item.id).reduce((s, l) => s + l.quantity, 0);
      return total <= item.min_qty;
    });

    const recentTasksWithRelations = tasks.slice(0, 5).map((t) => ({
      ...t,
      sites: { name: sites.find((s) => s.id === t.site_id)?.name ?? "" },
      employees: t.employee_id ? { name: employees.find((e) => e.id === t.employee_id)?.name ?? "" } : null,
    }));

    const recentMovementsWithRelations = movements.map((m) => ({
      ...m,
      items: { name: items.find((i) => i.id === m.item_id)?.name ?? "" },
    }));

    setData({
      activeSiteCount: activeSites.length,
      openTaskCount: openTasks.length,
      hoursThisWeek,
      lowStockCount: lowStockItems.length,
      recentTasks: recentTasksWithRelations,
      recentMovements: recentMovementsWithRelations,
      activeSites,
      lowStockItems,
    });
  }, []);

  if (!data) return null;

  return (
    <AppShell title="Dashboard">
      <Dashboard {...data} />
    </AppShell>
  );
}

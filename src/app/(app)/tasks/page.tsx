"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TasksBoard } from "@/components/tasks/tasks-board";
import * as db from "@/lib/db";
import type { Employee, Site } from "@/lib/database.types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const load = useCallback(() => {
    const allSites = db.getSites();
    const allEmployees = db.getEmployees();
    const raw = db.getTasks();
    const enriched = raw.map((t) => ({
      ...t,
      sites: { name: allSites.find((s) => s.id === t.site_id)?.name ?? "" },
      employees: t.employee_id ? { name: allEmployees.find((e) => e.id === t.employee_id)?.name ?? "" } : null,
    }));
    setTasks(enriched);
    setSites(allSites);
    setEmployees(allEmployees.filter((e) => e.status === "Active"));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppShell title="Tasks">
      <TasksBoard tasks={tasks} sites={sites} employees={employees} onRefresh={load} />
    </AppShell>
  );
}

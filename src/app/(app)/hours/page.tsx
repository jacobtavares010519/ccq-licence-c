"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HoursList } from "@/components/hours/hours-list";
import * as db from "@/lib/db";
import type { Employee, Site } from "@/lib/database.types";

export default function HoursPage() {
  const [hours, setHours] = useState<unknown[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const load = useCallback(() => {
    const allEmployees = db.getEmployees();
    const allSites = db.getSites();
    const raw = db.getHours().slice(0, 200);
    const enriched = raw.map((h) => ({
      ...h,
      employees: { name: allEmployees.find((e) => e.id === h.employee_id)?.name ?? "" },
      sites: { name: allSites.find((s) => s.id === h.site_id)?.name ?? "" },
    }));
    setHours(enriched);
    setEmployees(allEmployees.filter((e) => e.status === "Active"));
    setSites(allSites.filter((s) => s.status === "Active"));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppShell title="Hours">
      <div className="max-w-4xl mx-auto">
        <HoursList hours={hours} employees={employees} sites={sites} onRefresh={load} />
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SiteDetail } from "@/components/sites/site-detail";
import * as db from "@/lib/db";
import type { Site, Task, Hours, Employee } from "@/lib/database.types";

export function SiteDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<{
    site: Site;
    tasks: Task[];
    hours: Hours[];
    employees: Employee[];
  } | null>(null);

  const load = () => {
    const site = db.getSite(id);
    if (!site) { router.replace("/sites"); return; }
    const allEmployees = db.getEmployees();
    const rawHours = db.getHours().filter((h) => h.site_id === id);
    const hoursWithEmployee = rawHours.map((h) => ({
      ...h,
      employees: { name: allEmployees.find((e) => e.id === h.employee_id)?.name ?? "" },
    }));
    setData({
      site,
      tasks: db.getTasks().filter((t) => t.site_id === id),
      hours: hoursWithEmployee as Hours[],
      employees: allEmployees.filter((e) => e.status === "Active"),
    });
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return null;

  return (
    <AppShell title={data.site.name}>
      <div className="max-w-4xl mx-auto">
        <SiteDetail {...data} onRefresh={load} />
      </div>
    </AppShell>
  );
}

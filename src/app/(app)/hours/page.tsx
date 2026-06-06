import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { HoursList } from "@/components/hours/hours-list";
import type { Employee, Site } from "@/lib/database.types";

export default async function HoursPage() {
  const supabase = await createClient();

  const [hoursRes, employeesRes, sitesRes] = await Promise.all([
    supabase
      .from("hours")
      .select("*, employees(name), sites(name)")
      .order("date", { ascending: false })
      .limit(200),
    supabase.from("employees").select("*").eq("status", "Active").order("name"),
    supabase.from("sites").select("*").eq("status", "Active").order("name"),
  ]);

  return (
    <AppShell title="Hours">
      <div className="max-w-4xl mx-auto">
        <HoursList
          hours={(hoursRes.data || []) as unknown[]}
          employees={(employeesRes.data || []) as Employee[]}
          sites={(sitesRes.data || []) as Site[]}
        />
      </div>
    </AppShell>
  );
}

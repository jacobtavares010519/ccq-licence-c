import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();

  const [hoursRes, tasksRes, sitesRes, employeesRes] = await Promise.all([
    supabase
      .from("hours")
      .select("*, employees(name), sites(name)")
      .order("date"),
    supabase
      .from("tasks")
      .select("*, sites(name), employees(name)")
      .neq("status", "Done")
      .order("due_date"),
    supabase.from("sites").select("*").eq("status", "Active").order("name"),
    supabase.from("employees").select("*").eq("status", "Active").order("name"),
  ]);

  return (
    <AppShell title="Calendar">
      <CalendarView
        hours={(hoursRes.data || []) as unknown[]}
        tasks={(tasksRes.data || []) as unknown[]}
        sites={(sitesRes.data || []) as unknown[]}
        employees={(employeesRes.data || []) as unknown[]}
      />
    </AppShell>
  );
}

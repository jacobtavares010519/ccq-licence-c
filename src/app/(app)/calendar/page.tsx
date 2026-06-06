import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const supabase = await createClient();

  // Fetch ±1 month around today so navigation feels instant for the common case
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    .toISOString()
    .split("T")[0];

  const [hoursRes, tasksRes, sitesRes, employeesRes] = await Promise.all([
    supabase
      .from("hours")
      .select("*, employees(name), sites(name)")
      .gte("date", from)
      .lte("date", to)
      .order("date"),
    supabase
      .from("tasks")
      .select("*, sites(name), employees(name)")
      .neq("status", "Done")
      .not("due_date", "is", null)
      .gte("due_date", from)
      .lte("due_date", to)
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
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth()}
      />
    </AppShell>
  );
}

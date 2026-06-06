import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TasksBoard } from "@/components/tasks/tasks-board";
import type { Employee, Site } from "@/lib/database.types";

export default async function TasksPage() {
  const supabase = await createClient();

  const [tasksRes, sitesRes, employeesRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, sites(name), employees(name)")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at"),
    supabase.from("sites").select("*").order("name"),
    supabase.from("employees").select("*").eq("status", "Active").order("name"),
  ]);

  return (
    <AppShell title="Tasks">
      <TasksBoard
        tasks={(tasksRes.data || []) as unknown[]}
        sites={(sitesRes.data || []) as Site[]}
        employees={(employeesRes.data || []) as Employee[]}
      />
    </AppShell>
  );
}
